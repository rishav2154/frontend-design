import { motion } from 'framer-motion';
import { Heart, Home, ShoppingBag, Sparkles, Store } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { shouldShowMobileBottomNav } from '@/lib/mobileNavigation';

const navItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Store, label: 'Shop', path: '/shop' },
  { icon: Sparkles, label: 'Studio', path: '/customize-phone-cover', emphasized: true },
  { icon: Heart, label: 'Wishlist', path: '/wishlist' },
  { icon: ShoppingBag, label: 'Cart', path: '/cart' },
];

export const MobileBottomNav = () => {
  const location = useLocation();
  const totalItems = useCartStore((state) => state.getTotalItems());
  const wishlistItems = useWishlistStore((state) => state.items);
  const isLanding = location.pathname === '/';

  if (!shouldShowMobileBottomNav(location.pathname)) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`fixed inset-x-0 bottom-0 z-40 md:hidden ${isLanding ? 'home-editorial-surface home-mobile-nav-wrap' : ''}`}
    >
      <nav
        className={`${isLanding ? 'home-mobile-nav-surface' : 'border-t border-border/50 bg-background/95 shadow-2xl backdrop-blur-xl'} mx-auto max-w-xl`}
        aria-label="Mobile navigation"
      >
        <div className="grid h-16 grid-cols-5 items-end px-1">
          {navItems.map((item) => {
            const isActive = item.path === '/customize-phone-cover'
              ? location.pathname.startsWith(item.path)
              : location.pathname === item.path;
            const count = item.label === 'Cart'
              ? totalItems
              : item.label === 'Wishlist'
                ? wishlistItems.length
                : 0;
            const hasBadge = count > 0;

            if (item.emphasized) {
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className="group relative flex h-full min-w-0 flex-col items-center justify-end gap-1 pb-1.5"
                  aria-current={isActive ? 'page' : undefined}
                  aria-label="Open the custom case studio"
                >
                  <motion.span
                    whileTap={{ scale: 0.94 }}
                    className={`grid h-14 w-14 -translate-y-2 place-items-center rounded-full border-[5px] shadow-lg transition-transform group-hover:-translate-y-2.5 ${
                      isLanding
                        ? 'home-studio-action'
                        : 'border-background bg-accent-gradient text-accent-foreground shadow-accent/25'
                    } ${isActive ? 'ring-2 ring-accent ring-offset-2 ring-offset-background' : ''}`}
                  >
                    <item.icon className="h-5 w-5" strokeWidth={2.4} aria-hidden="true" />
                  </motion.span>
                  <span className={`absolute bottom-1 text-[10px] font-bold leading-none ${isLanding ? 'text-foreground' : isActive ? 'text-accent' : 'text-foreground'}`}>
                    {item.label}
                  </span>
                </Link>
              );
            }

            return (
              <Link
                key={item.label}
                to={item.path}
                className={`group relative flex h-full min-w-0 flex-col items-center justify-center gap-1 pb-1 transition-colors ${
                  isLanding
                    ? isActive
                      ? 'text-accent'
                      : 'text-foreground/55 hover:text-foreground'
                    : isActive
                      ? 'text-accent'
                      : 'text-muted-foreground hover:text-foreground'
                }`}
                aria-current={isActive ? 'page' : undefined}
                aria-label={`${item.label}${hasBadge ? `, ${count} item${count === 1 ? '' : 's'}` : ''}`}
              >
                {isActive && (
                  <motion.span
                    layoutId="activeMobileNavIndicator"
                    className={`absolute left-1/2 top-1 h-1 w-8 -translate-x-1/2 rounded-full ${
                      isLanding ? 'bg-gradient-to-r from-transparent via-accent to-transparent' : 'bg-gradient-to-r from-accent via-accent/80 to-transparent'
                    }`}
                    aria-hidden="true"
                  />
                )}

                <motion.span whileTap={{ scale: 0.92 }} className="relative rounded-full p-1.5 transition-colors group-hover:bg-foreground/5">
                  <item.icon className={`h-[21px] w-[21px] transition-all ${isActive ? 'stroke-[2.5]' : ''}`} aria-hidden="true" />
                  {hasBadge && (
                    <motion.span
                      initial={{ scale: 0, y: -4 }}
                      animate={{ scale: 1, y: 0 }}
                      className="absolute -right-2.5 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-background bg-accent px-1 text-[10px] font-bold text-accent-foreground shadow-md"
                      aria-hidden="true"
                    >
                      {count}
                    </motion.span>
                  )}
                </motion.span>

                <span className={`max-w-full truncate text-[10px] leading-none ${isActive ? 'font-bold' : 'font-medium'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </motion.div>
  );
};
