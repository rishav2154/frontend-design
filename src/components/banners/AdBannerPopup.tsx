import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { apiFetch, endpoints } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import {
  ChevronLeft, ChevronRight, X, Copy, Check, Ticket, ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Banner {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  coupon_code: string | null;
  cta_text: string | null;
  cta_link: string | null;
  bg_color: string;
  text_color: string;
  accent_color: string;
  priority: number;
}

interface BannerResponse {
  banners: Banner[];
  settings: { isEnabled: boolean; permanentCloseOnLast: boolean };
}

type BannerEvent = 'view' | 'click' | 'copy' | 'dismiss';

const PERMANENT_KEY = 'ad_banners_permanent_dismissed';
const SESSION_KEY = 'ad_banners_session_dismissed';

const safeGet = (storage: Storage, key: string): string | null => {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
};

const safeSet = (storage: Storage, key: string, value: string) => {
  try {
    storage.setItem(key, value);
  } catch {
    /* storage unavailable — ignore */
  }
};

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%' }),
  center: { x: 0 },
  exit: (dir: number) => ({ x: dir > 0 ? '-100%' : '100%' }),
};

const isDismissed = () =>
  safeGet(localStorage, PERMANENT_KEY) === '1' ||
  safeGet(sessionStorage, SESSION_KEY) === '1';

export const AdBannerPopup = () => {
  const location = useLocation();
  const { toast } = useToast();

  const [banners, setBanners] = useState<Banner[]>([]);
  const [settings, setSettings] = useState({
    isEnabled: true,
    permanentCloseOnLast: false,
  });
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [copied, setCopied] = useState(false);
  const [aspects, setAspects] = useState<Record<string, number>>({});

  const viewedRef = useRef<Set<string>>(new Set());
  const preloadedRef = useRef<Set<string>>(new Set());
  const dialogRef = useRef<HTMLDivElement>(null);
  const isAdminRoute = location.pathname.startsWith('/admin');

  /* ---------------- METRICS ---------------- */

  const track = useCallback((bannerId: string, eventType: BannerEvent) => {
    apiFetch(endpoints.banners.events(bannerId), {
      method: 'POST',
      body: JSON.stringify({ eventType }),
      skipAuth: true,
    }).catch(() => {
      /* metrics are best-effort */
    });
  }, []);

  /* ---------------- FETCH ---------------- */

  useEffect(() => {
    if (isAdminRoute) return;
    if (isDismissed()) return;

    let cancelled = false;

    apiFetch<BannerResponse>(endpoints.banners.list, { skipAuth: true })
      .then((data) => {
        if (cancelled) return;
        if (data?.settings?.isEnabled && data.banners?.length) {
          setBanners(data.banners);
          setSettings(data.settings);
          setVisible(true);
        }
      })
      .catch(() => {
        /* banner fetch is best-effort */
      });

    return () => {
      cancelled = true;
    };
  }, [isAdminRoute]);

  /* ---------------- IMAGE SIZING ----------------
     Measure each banner image so the popup can match its natural aspect ratio. */

  useEffect(() => {
    banners.forEach((banner) => {
      const url = banner.image_url;
      if (!url || preloadedRef.current.has(url)) return;
      preloadedRef.current.add(url);

      const probe = new Image();
      probe.onload = () => {
        if (!probe.naturalWidth || !probe.naturalHeight) return;
        const ratio = probe.naturalWidth / probe.naturalHeight;
        setAspects((prev) => (prev[url] ? prev : { ...prev, [url]: ratio }));
      };
      probe.src = url;
    });
  }, [banners]);

  /* ---------------- PERMANENT CLOSE ---------------- */

  const current = banners[index];
  const isLast = index === banners.length - 1;

  // Record a view once per banner.
  useEffect(() => {
    if (!visible || !current) return;
    if (viewedRef.current.has(current.id)) return;
    viewedRef.current.add(current.id);
    track(current.id, 'view');
  }, [visible, current, track]);

  // Reaching + viewing the final banner permanently dismisses the system.
  useEffect(() => {
    if (!visible || !isLast || !current) return;
    if (!settings.permanentCloseOnLast) return;
    safeSet(localStorage, PERMANENT_KEY, '1');
  }, [visible, isLast, current, settings.permanentCloseOnLast]);

  /* ---------------- NAVIGATION ---------------- */

  const paginate = useCallback(
    (dir: number) => {
      setDirection(dir);
      setIndex((prev) => {
        const next = prev + dir;
        if (next < 0 || next > banners.length - 1) return prev;
        return next;
      });
      setCopied(false);
    },
    [banners.length]
  );

  const goTo = (i: number) => {
    setDirection(i > index ? 1 : -1);
    setIndex(i);
    setCopied(false);
  };

  const close = () => {
    const wasLast = isLast;
    if (current) track(current.id, 'dismiss');
    if (!(wasLast && settings.permanentCloseOnLast)) {
      safeSet(sessionStorage, SESSION_KEY, '1');
    }
    setVisible(false);
  };

  /* ---------------- KEYBOARD / FOCUS ---------------- */

  useEffect(() => {
    if (!visible) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') paginate(1);
      else if (e.key === 'ArrowLeft') paginate(-1);
      else if (e.key === 'Tab' && dialogRef.current) {
        const focusable = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
          ),
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (!first || !last) {
          e.preventDefault();
          dialogRef.current.focus();
        } else if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, paginate, index, isLast]);

  /* ---------------- COPY ---------------- */

  const handleCopy = async (code: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(code);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = code;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      setCopied(true);
      track(current.id, 'copy');
      toast({ title: 'Coupon copied!', description: `Code "${code}" copied to clipboard.` });
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: 'Copy failed',
        description: 'Please copy the code manually.',
        variant: 'destructive',
      });
    }
  };

  const handleCtaClick = () => {
    if (current) track(current.id, 'click');
  };

  /* ---------------- RENDER ---------------- */

  if (!visible || !current) return null;

  const hasImage = !!current.image_url;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={close}
      >
        <motion.div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={`Advertisement: ${current.title}`}
          tabIndex={-1}
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 240, damping: 26 }}
          onClick={(e) => e.stopPropagation()}
          className="ad-banner-card relative overflow-hidden rounded-2xl shadow-2xl outline-none"
          style={
            {
              '--ar': current.image_url ? aspects[current.image_url] : undefined,
              backgroundColor: current.bg_color,
              color: current.text_color,
            } as CSSProperties
          }
        >
          {/* Sliding banner (background image + floating content) */}
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.div
              key={current.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ x: { type: 'spring', stiffness: 300, damping: 32 } }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.15}
              onDragEnd={(_, info) => {
                if (info.offset.x < -60) paginate(1);
                else if (info.offset.x > 60) paginate(-1);
              }}
              className="absolute inset-0 cursor-grab active:cursor-grabbing"
            >
              {/* Background picture — full bleed, never distorted */}
              {hasImage ? (
                <img
                  src={current.image_url as string}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(135deg, ${current.bg_color}, ${current.accent_color})`,
                  }}
                />
              )}

              {/* Legibility scrim — keeps the top of the image clear */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

              {/* Floating content */}
              <div className="absolute inset-x-0 bottom-0 flex max-h-full flex-col gap-3 overflow-y-auto overscroll-contain p-4 sm:p-6">
                <div className="space-y-1.5">
                  <h2 className="text-2xl sm:text-3xl font-bold leading-tight drop-shadow-md">
                    {current.title}
                  </h2>
                  {current.description && (
                    <p className="text-sm sm:text-base text-white/90 drop-shadow line-clamp-3 whitespace-pre-line">
                      {current.description}
                    </p>
                  )}
                </div>

                {/* Translucent glass panel for coupon + CTA */}
                {(current.coupon_code || (current.cta_text && current.cta_link)) && (
                  <div className="rounded-2xl border border-white/15 bg-black/35 backdrop-blur-md p-3 sm:p-4">
                    <div className="ad-banner-actions">
                      {current.coupon_code && (
                        <div
                          className="flex flex-1 items-center gap-2 rounded-xl border border-dashed bg-black/30 px-3 py-2"
                          style={{ borderColor: current.accent_color }}
                        >
                          <Ticket
                            className="h-4 w-4 shrink-0"
                            style={{ color: current.accent_color }}
                          />
                          <span className="flex-1 truncate font-mono text-sm sm:text-base font-semibold tracking-[0.2em]">
                            {current.coupon_code}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(current.coupon_code as string)}
                            aria-label={
                              copied
                                ? 'Coupon code copied'
                                : `Copy coupon code ${current.coupon_code}`
                            }
                            className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:text-sm"
                            style={{
                              backgroundColor: current.accent_color,
                              color: current.text_color,
                            }}
                          >
                            {copied ? (
                              <>
                                <Check className="h-4 w-4" /> Copied
                              </>
                            ) : (
                              <>
                                <Copy className="h-4 w-4" /> Copy
                              </>
                            )}
                          </button>
                        </div>
                      )}

                      {current.cta_text && current.cta_link && (
                        <a
                          href={current.cta_link}
                          onClick={handleCtaClick}
                          className="inline-flex h-11 max-w-full shrink-0 items-center justify-center gap-2 rounded-xl px-5 text-sm sm:text-base font-semibold shadow-lg transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                          style={{
                            backgroundColor: current.accent_color,
                            color: current.text_color,
                          }}
                        >
                          {current.cta_text}
                          <ArrowRight className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Navigation */}
                {banners.length > 1 && (
                  <div className="flex items-center justify-center gap-4">
                    <button
                      type="button"
                      onClick={() => paginate(-1)}
                      disabled={index === 0}
                      aria-label="Previous banner"
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/35 backdrop-blur-md transition hover:bg-black/55 disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>

                    <div className="flex items-center gap-2" role="tablist" aria-label="Banner pagination">
                      {banners.map((b, i) => (
                        <button
                          key={b.id}
                          type="button"
                          role="tab"
                          aria-selected={i === index}
                          aria-label={`Go to banner ${i + 1} of ${banners.length}`}
                          onClick={() => goTo(i)}
                          className="relative flex h-11 min-w-11 items-center justify-center rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                        >
                          <span
                            className={cn(
                              'block h-2 rounded-full transition-all',
                              i === index ? 'w-6' : 'w-2 bg-white/50',
                            )}
                            style={
                              i === index
                                ? { backgroundColor: current.accent_color }
                                : undefined
                            }
                            aria-hidden="true"
                          />
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => paginate(1)}
                      disabled={isLast}
                      aria-label="Next banner"
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/35 backdrop-blur-md transition hover:bg-black/55 disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                )}

                {isLast && settings.permanentCloseOnLast && (
                  <p className="text-center text-xs text-white/70">
                    You've reached the last offer — banners won't show again.
                  </p>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Close */}
          <button
            type="button"
            onClick={close}
            aria-label="Close advertisement"
            className="absolute right-2 top-2 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/40 backdrop-blur-md transition hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:right-3 sm:top-3"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AdBannerPopup;
