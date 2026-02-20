import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Heart, Menu, X, Search, User, LogOut, Package } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SearchDialog } from '@/components/search/SearchDialog';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { apiFetch } from '@/lib/api';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Shop', path: '/shop' },
  { name: 'Customize', path: '/customize' },
  { name: 'About', path: '/about' },
  , { name: 'Return Policy', path: '/returns' }
];

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const totalItems = useCartStore(state => state.getTotalItems());
  const wishlistItems = useWishlistStore(state => state.items);
  const openCart = useCartStore(state => state.openCart);

  /* ---------------- SCROLL EFFECT ---------------- */
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* ---------------- CLOSE MOBILE ON ROUTE CHANGE ---------------- */
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  /* ---------------- FETCH LOGGED USER ---------------- */
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    apiFetch('/api/auth/me')
      .then((data) => setUser(data))
      .catch(() => setUser(null));
  }, []);

  /* ---------------- LOGOUT ---------------- */
  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-lg shadow-background/50'
          : 'bg-gradient-to-b from-background/80 to-transparent'
      }`}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <nav className="flex items-center justify-between h-16 md:h-20">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div whileHover={{ scale: 1.05 }} className="relative">
              <span className="text-2xl font-bold text-gradient-accent">The Design Hive</span>
              <motion.div className="absolute -bottom-1 left-0 h-0.5 bg-accent-gradient w-0 group-hover:w-full transition-all duration-300" />
            </motion.div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <Link
                key={link.name}
                to={link.path}
                className={`relative text-sm font-medium ${
                  location.pathname === link.path
                    ? 'text-accent'
                    : 'text-foreground/70 hover:text-foreground'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">

            <ThemeToggle />

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSearchOpen(true)}
              className="hidden md:flex w-10 h-10 rounded-full bg-muted/50 items-center justify-center"
            >
              <Search className="w-5 h-5" />
            </motion.button>

            <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />

            {/* Wishlist */}
            <Link to="/wishlist">
              <div className="relative hidden md:flex w-10 h-10 rounded-full bg-muted/50 items-center justify-center">
                <Heart className="w-5 h-5" />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 text-xs bg-accent text-white rounded-full flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </div>
            </Link>

            {/* Cart */}
            <div onClick={openCart} className="relative w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center cursor-pointer">
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 text-xs bg-accent text-white rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </div>

            {/* USER */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="hidden md:flex w-10 h-10 rounded-full bg-accent/20 items-center justify-center cursor-pointer">
                    <User className="w-5 h-5 text-accent" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem className="text-sm text-muted-foreground">
                    {user.email}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/orders')}>
                    <Package className="w-4 h-4 mr-2" />
                    My Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <div className="hidden md:flex w-10 h-10 rounded-full bg-muted/50 items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
              </Link>
            )}

            {/* Mobile Menu */}
            <div
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center"
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </div>
          </div>
        </nav>
      </div>
    </motion.header>
  );
};
