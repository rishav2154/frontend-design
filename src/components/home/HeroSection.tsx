import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import {
  ArrowUpRight,
  Check,
  ImagePlus,
  MessageCircle,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import productPhone from '@/assets/product-phone.jpg';
import phoneInHand from '@/assets/landing/phone-in-hand.webp';

const highPriorityImageProps = { fetchpriority: 'high' } as const;

export const HeroSection = () => {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const isHeroInView = useInView(sectionRef, { margin: '120px 0px' });

  return (
    <section ref={sectionRef} className="home-hero relative overflow-hidden" aria-labelledby="hero-heading">
      <div className="home-shell grid min-h-[calc(100svh-8.4rem)] items-center gap-12 px-4 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:grid-cols-[0.88fr_1.12fr] lg:gap-9 lg:px-8 lg:pb-20 lg:pt-12 xl:gap-14">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="home-hero-copy relative z-10 max-w-[45rem]"
        >
          <p className="home-chip home-eyebrow mb-6 w-fit">
            <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_12px_rgb(var(--home-accent-rgb)/0.65)]" aria-hidden="true" />
            Custom cases, made personal
          </p>

          <h1 id="hero-heading" className="font-editorial home-hero-heading text-foreground">
            <span>Your story,</span>
            <span className="home-gradient-copy">carried every</span>
            <span>day.</span>
          </h1>

          <p className="mt-7 max-w-[37rem] text-[15px] leading-7 text-foreground/[0.7] sm:text-lg sm:leading-8">
            Turn a favourite photo into a phone case that feels completely yours. Choose your model, upload your image, and preview it before you order.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/customize-phone-cover" className="home-button home-button-primary group">
              <ImagePlus className="h-[18px] w-[18px]" aria-hidden="true" />
              Customize Now
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
            <Link to="/shop?category=phone-cover" className="home-button home-button-secondary">
              <Smartphone className="h-[18px] w-[18px]" aria-hidden="true" />
              Shop Cases
            </Link>
          </div>

          <div className="home-hero-proof" aria-label="Ordering benefits">
            <span><Check className="h-3.5 w-3.5 text-accent" aria-hidden="true" />Exact model fit</span>
            <span><ShieldCheck className="h-3.5 w-3.5 text-accent" aria-hidden="true" />Secure checkout</span>
            <span><MessageCircle className="h-3.5 w-3.5 text-accent" aria-hidden="true" />Human support</span>
          </div>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, scale: 0.965, x: 18 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.85, delay: reduceMotion ? 0 : 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="home-hero-visual"
        >
          <motion.div
            animate={reduceMotion || !isHeroInView ? undefined : { y: [0, -8, 0], x: [0, 4, 0] }}
            transition={{ duration: 8.5, repeat: Infinity, ease: 'easeInOut' }}
            className="home-hero-orb"
            aria-hidden="true"
          />
          <div className="home-glass-pane home-glass-pane-one" aria-hidden="true" />
          <div className="home-glass-pane home-glass-pane-two" aria-hidden="true" />

          <div className="home-device-stage liquid-glass-luminous">
            <img
              {...highPriorityImageProps}
              src={phoneInHand}
              alt="A person holding a smartphone ready for a personal design"
              className="home-device-image"
              loading="eager"
              decoding="async"
            />
          </div>

          <motion.div
            animate={reduceMotion || !isHeroInView ? undefined : { rotate: [5, 7, 5], y: [0, -5, 0] }}
            transition={{ duration: 7.5, repeat: Infinity, ease: 'easeInOut' }}
            className="home-hero-badge"
          >
            <div>
              <Smartphone className="mx-auto mb-1.5 h-4 w-4 text-accent" strokeWidth={1.7} aria-hidden="true" />
              <span className="block text-[8px] font-bold uppercase leading-[1.35] tracking-[0.16em] sm:text-[9px]">
                Your phone.<br />Your design.
              </span>
            </div>
          </motion.div>

          <Link
            to="/customize-phone-cover"
            className="home-product-preview liquid-glass-raised"
            aria-label="Open the custom phone-case studio"
          >
            <img src={productPhone} alt="A personalized printed phone case" />
            <span className="min-w-0">
              <span className="block text-[9px] font-bold uppercase tracking-[0.16em] text-accent">Live preview</span>
              <span className="mt-1 block truncate text-xs font-semibold sm:text-sm">Your photo, made tangible</span>
              <span className="mt-1 flex items-center gap-1 text-[10px] text-foreground/55">
                Open studio <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
              </span>
            </span>
          </Link>

          <div className="home-visual-status liquid-glass" aria-label="Customization flow: choose, upload, preview">
            <span className="text-[8px] font-bold uppercase tracking-[0.17em] text-foreground/55 sm:text-[9px]">Choose</span>
            <span className="home-visual-status-dot is-active" aria-hidden="true" />
            <span className="home-visual-status-dot" aria-hidden="true" />
            <span className="home-visual-status-dot" aria-hidden="true" />
            <span className="text-[8px] font-bold uppercase tracking-[0.17em] text-foreground/55 sm:text-[9px]">Preview</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
