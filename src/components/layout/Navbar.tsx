import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowUpRight,
  Heart,
  LogOut,
  Menu,
  Package,
  Search,
  ShoppingBag,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { apiFetch, endpoints } from '@/lib/api';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SearchDialog } from '@/components/search/SearchDialog';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { shouldShowMobileBottomNav } from '@/lib/mobileNavigation';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Shop', path: '/shop' },
  { name: 'Customize', path: '/customize' },
  { name: 'About', path: '/about' },
  { name: 'Return Policy', path: '/returns' },
];

interface AuthUser {
  email?: string;
  avatar_url?: string;
}

const isLinkActive = (pathname: string, path: string) => {
  if (path === '/') return pathname === '/';
  if (path === '/shop') {
    return pathname === '/shop' || (pathname.startsWith('/product/') && pathname !== '/product/customize-phone-cover');
  }
  if (path === '/customize') {
    return pathname === '/customize' || pathname.startsWith('/customize-phone-cover') || pathname === '/product/customize-phone-cover';
  }
  return pathname === path;
};

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const hasMobileBottomNav = shouldShowMobileBottomNav(location.pathname);

  const totalItems = useCartStore((state) => state.getTotalItems());
  const wishlistItems = useWishlistStore((state) => state.items);
  const openCart = useCartStore((state) => state.openCart);

  useEffect(() => {
    let animationFrame = 0;

    const updateScrollState = () => {
      animationFrame = 0;
      const nextIsScrolled = window.scrollY > 32;
      setIsScrolled((currentIsScrolled) =>
        currentIsScrolled === nextIsScrolled ? currentIsScrolled : nextIsScrolled,
      );
    };

    const handleScroll = () => {
      if (animationFrame !== 0) return;
      animationFrame = window.requestAnimationFrame(updateScrollState);
    };

    updateScrollState();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (animationFrame !== 0) window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    const menuTrigger = menuTriggerRef.current;
    const focusableSelector =
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

    document.body.style.overflow = 'hidden';
    window.requestAnimationFrame(() => {
      menuRef.current?.querySelector<HTMLElement>(focusableSelector)?.focus();
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
        return;
      }

      if (event.key !== 'Tab' || !menuRef.current) return;

      const focusable = Array.from(
        menuRef.current.querySelectorAll<HTMLElement>(focusableSelector),
      ).filter((element) => !element.hasAttribute('disabled'));

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
      menuTrigger?.focus();
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const fetchUser = async () => {
      try {
        const data = await apiFetch(endpoints.auth.me) as AuthUser;
        setUser(data);
      } catch {
        setUser(null);
        localStorage.removeItem('token');
      }
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
  };

  const accountMenu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.button
          type="button"
          whileTap={{ scale: 0.95 }}
          className="home-nav-icon is-account relative hidden xl:inline-flex"
          aria-label="Open account menu"
        >
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover" />
          ) : (
            <User className="h-[18px] w-[18px]" aria-hidden="true" />
          )}
        </motion.button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52 rounded-2xl border-border/60 bg-popover/95 p-1.5 shadow-2xl backdrop-blur-2xl">
        <DropdownMenuItem className="rounded-xl text-sm text-muted-foreground">
          {user?.email}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/account')} className="rounded-xl">
          <User className="mr-2 h-4 w-4" aria-hidden="true" />
          My Account
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/orders')} className="rounded-xl">
          <Package className="mr-2 h-4 w-4" aria-hidden="true" />
          My Orders
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout} className="rounded-xl text-destructive">
          <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <>
      <a href="#main-content" className="home-skip-link">Skip to main content</a>

      <motion.header
        initial={{ y: -90, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="home-editorial-surface home-navbar-header fixed inset-x-0 top-0 z-50"
      >
        <div className={`home-navbar-shell ${isScrolled ? 'is-scrolled' : ''}`}>
          <nav className="flex h-14 items-center justify-between gap-2 px-2 sm:h-16 sm:px-3 lg:px-4" aria-label="Primary navigation">
            <Link to="/" className="home-logo-link flex min-w-0 items-center gap-2 rounded-full" aria-label="The Design Hive home">
              <span className="home-logo-mark" aria-hidden="true">
                <Sparkles className="h-4 w-4" strokeWidth={1.8} />
              </span>
              <span className="font-editorial block truncate text-[1.08rem] tracking-[-0.025em] min-[360px]:text-lg sm:text-xl">
                The Design Hive
              </span>
            </Link>

            <div className="home-nav-links hidden xl:flex">
              {navLinks.map((link) => {
                const isActive = isLinkActive(location.pathname, link.path);

                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`home-nav-link ${isActive ? 'is-active' : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>

            <div className="home-nav-actions shrink-0">
              <div className="home-theme-control hidden lg:block">
                <ThemeToggle />
              </div>

              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => setSearchOpen(true)}
                className="home-nav-icon relative hidden lg:inline-flex"
                aria-label="Search products"
              >
                <Search className="h-[18px] w-[18px]" aria-hidden="true" />
              </motion.button>

              <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />

              <Link
                to="/wishlist"
                className="home-nav-icon relative hidden lg:inline-flex"
                aria-label={`Open wishlist${wishlistItems.length > 0 ? `, ${wishlistItems.length} item${wishlistItems.length === 1 ? '' : 's'}` : ''}`}
              >
                <Heart className="h-[18px] w-[18px]" aria-hidden="true" />
                {wishlistItems.length > 0 && (
                  <span className="home-nav-count" aria-hidden="true">{wishlistItems.length}</span>
                )}
              </Link>

              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={openCart}
                className={`home-nav-icon relative ${hasMobileBottomNav ? 'hidden min-[360px]:inline-flex' : 'inline-flex'}`}
                aria-label={`Open cart${totalItems > 0 ? `, ${totalItems} item${totalItems === 1 ? '' : 's'}` : ''}`}
              >
                <ShoppingBag className="h-[18px] w-[18px]" aria-hidden="true" />
                {totalItems > 0 && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="home-nav-count" aria-hidden="true">
                    {totalItems}
                  </motion.span>
                )}
              </motion.button>

              {user ? accountMenu : (
                <Link to="/auth" className="home-nav-icon is-account relative hidden xl:inline-flex" aria-label="Sign in or create an account">
                  <User className="h-[18px] w-[18px]" aria-hidden="true" />
                </Link>
              )}

              <motion.button
                ref={menuTriggerRef}
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMobileMenuOpen((open) => !open)}
                className="home-nav-icon relative inline-flex xl:hidden"
                aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-navigation-menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-[19px] w-[19px]" aria-hidden="true" />
                ) : (
                  <Menu className="h-[19px] w-[19px]" aria-hidden="true" />
                )}
              </motion.button>
            </div>
          </nav>
        </div>
      </motion.header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close navigation menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="home-mobile-menu-overlay xl:hidden"
            />
            <motion.div
              ref={menuRef}
              id="mobile-navigation-menu"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              initial={{ opacity: 0, y: -12, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.985 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="home-editorial-surface home-mobile-menu xl:hidden"
            >
              <div className="space-y-0.5">
                {navLinks.map((link) => {
                  const isActive = isLinkActive(location.pathname, link.path);

                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`home-mobile-menu-link ${isActive ? 'is-active' : ''}`}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {link.name}
                      <ArrowUpRight className="h-4 w-4 opacity-55" aria-hidden="true" />
                    </Link>
                  );
                })}
              </div>

              <div className="home-mobile-menu-action-grid">
                <button
                  type="button"
                  onClick={() => {
                    setSearchOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="home-mobile-menu-action"
                >
                  <Search className="h-5 w-5" aria-hidden="true" />
                  Search
                </button>
                <Link to="/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="home-mobile-menu-action relative">
                  <Heart className="h-5 w-5" aria-hidden="true" />
                  Wishlist
                  {wishlistItems.length > 0 && <span className="home-nav-count" aria-hidden="true">{wishlistItems.length}</span>}
                </Link>
                <Link to={user ? '/account' : '/auth'} onClick={() => setIsMobileMenuOpen(false)} className="home-mobile-menu-action">
                  <User className="h-5 w-5" aria-hidden="true" />
                  {user ? 'Account' : 'Sign in'}
                </Link>
              </div>

              <div className="mt-2 flex min-h-12 items-center justify-between rounded-2xl border border-foreground/10 bg-foreground/[0.035] px-3">
                <span className="text-xs font-medium text-foreground/70">Appearance</span>
                <div className="home-theme-control">
                  <ThemeToggle />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
