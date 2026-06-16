import { motion } from 'framer-motion';
import { Home, ShoppingBag, Store, User, Heart } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';

const navItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Store, label: 'Shop', path: '/shop' },
  { icon: Heart, label: 'Wishlist', path: '/wishlist' },
  { icon: ShoppingBag, label: 'Cart', path: '/cart' },
  { icon: User, label: 'Account', path: '/account' },
];

export const MobileBottomNav = () => {
  const location = useLocation();
  const totalItems = useCartStore((state) => state.getTotalItems());
  const wishlistItems = useWishlistStore((state) => state.items);

  // Hide on admin pages
  if (location.pathname.startsWith('/admin')) return null;

  return (
    <motion.nav 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur-xl border-t border-border/50 shadow-2xl shadow-black/10"
    >
      <div className="glass-card-hover flex items-center justify-around h-16 px-2">
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          const showCartBadge = item.label === 'Cart' && totalItems > 0;
          const showWishlistBadge = item.label === 'Wishlist' && wishlistItems.length > 0;

          return (
            <Link
              key={item.label}
              to={item.path}
              className={`group relative flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all duration-300 ${
                isActive 
                  ? 'text-accent scale-[1.05]' 
                  : 'text-muted-foreground hover:text-foreground group-hover:scale-[1.02]'
              }`}
            >
              {/* Active indicator - smooth slide */}
              {isActive && (
                <motion.div 
                  layoutId="activeNavIndicator"
                  className="absolute top-1 left-1/2 -translate-x-1/2 w-10 h-1 bg-gradient-to-r from-accent via-accent/80 to-transparent rounded-full shadow-lg"
                  style={{ originX: 0.5 }}
                />
              )}
              
              <div className="relative p-1.5 rounded-full group-hover:bg-accent/10 transition-colors">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <item.icon className={`w-5.5 h-5.5 transition-all duration-200 ${isActive ? 'stroke-[2.5] drop-shadow-sm shadow-accent/50' : ''}`} />
                </motion.div>
                
                {/* Dynamic badges */}
                {(showCartBadge || showWishlistBadge) && (
                  <motion.span 
                    initial={{ scale: 0, y: -4 }}
                    animate={{ scale: 1, y: 0 }}
                    className="absolute -top-3 -right-3 w-5 h-5 flex items-center justify-center text-[10px] font-bold bg-destructive text-destructive-foreground rounded-full shadow-md border-2 border-background"
                  >
                    {showCartBadge ? totalItems : wishlistItems.length}
                  </motion.span>
                )}
              </div>
              
              <motion.span 
                className={`text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                  isActive ? 'font-bold drop-shadow-sm shadow-accent/30' : ''
                }`}
                animate={{ y: isActive ? -1 : 0 }}
              >
                {item.label}
              </motion.span>
            </Link>
          );
        })}
      </div>
      
      {/* Safe area for devices with home indicators */}
      <div className="h-[env(safe-area-inset-bottom)] bg-background/95" />
    </motion.nav>
  );
};
