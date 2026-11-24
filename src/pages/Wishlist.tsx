import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { useWishlistStore } from '@/store/wishlistStore';
import { useCartStore } from '@/store/cartStore';
import { Button } from '@/components/ui/button';

const Wishlist = () => {
  const { items, removeItem } = useWishlistStore();
  const addToCart = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);

  const handleAddToCart = (item: typeof items[0]) => {
    addToCart({
      productId: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.image,
    });
    removeItem(item.id);
    openCart();
  };

  const handleAddAllToCart = () => {
    items.forEach((item) => {
      addToCart({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        image: item.image,
      });
    });
    items.forEach((item) => removeItem(item.id));
    openCart();
  };

  return (
    <div className="min-h-dvh min-h-dvh overflow-x-clip bg-background">
      <Navbar />
      <CartDrawer />

      <main className="pb-12 pt-20 sm:pb-16 sm:pt-24">
        <div className="container mx-auto px-3 min-[360px]:px-4 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 text-center sm:mb-12"
          >
            <span className="text-accent font-medium text-sm tracking-wider uppercase">
              Your Favorites
            </span>
            <h1 className="mt-4 text-3xl font-bold min-[360px]:text-4xl md:text-5xl">My Wishlist</h1>
            <p className="text-muted-foreground mt-4">
              {items.length} {items.length === 1 ? 'item' : 'items'} saved for later
            </p>
          </motion.div>

          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-14 text-center sm:py-20"
            >
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted/50 flex items-center justify-center">
                <Heart className="w-12 h-12 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">Your wishlist is empty</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Start adding items you love by clicking the heart icon on products
              </p>
              <Link to="/shop" className="inline-block w-full min-[360px]:w-auto">
                <Button className="btn-luxury min-h-11 w-full px-5 py-3 min-[360px]:w-auto sm:px-8 sm:py-4">
                  Browse Products
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </motion.div>
          ) : (
            <>
              {/* Action Bar */}
              <div className="mb-6 flex justify-stretch min-[420px]:justify-end">
                <Button onClick={handleAddAllToCart} className="btn-luxury min-h-11 w-full px-5 py-3 min-[420px]:w-auto sm:px-8 sm:py-4">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Add All to Cart
                </Button>
              </div>

              {/* Wishlist Grid */}
              <div className="grid grid-cols-1 gap-4 min-[360px]:grid-cols-2 min-[360px]:gap-3 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
                {items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    className="glass-card-hover group min-w-0 overflow-hidden"
                  >
                    {/* Image */}
                    <Link to={`/product/${item.id}`}>
                      <div className="relative aspect-square overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </Link>

                    {/* Content */}
                    <div className="p-3 min-[420px]:p-4">
                      <Link to={`/product/${item.id}`}>
                        <h3 className="font-medium text-sm line-clamp-1 hover:text-accent transition-colors">
                          {item.name}
                        </h3>
                      </Link>
                      <p className="text-xs text-muted-foreground mt-1 capitalize">
                        {item.category.replace('-', ' ')}
                      </p>
                      <div className="flex items-center justify-between mt-4">
                        <span className="break-words text-base font-bold min-[420px]:text-lg">₹{item.price.toFixed(2)}</span>
                      </div>

                      {/* Actions */}
                      <div className="mt-4 flex flex-col gap-2 min-[440px]:flex-row">
                        <Button
                          onClick={() => handleAddToCart(item)}
                          className="min-h-11 min-w-0 flex-1 bg-accent px-2 text-xs text-accent-foreground hover:bg-accent/90 min-[440px]:text-sm"
                        >
                          <ShoppingBag className="mr-1 h-4 w-4 shrink-0" />
                          <span className="truncate">Add to Cart</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => removeItem(item.id)}
                          className="min-h-11 w-full shrink-0 border-destructive/30 hover:bg-destructive hover:text-destructive-foreground min-[440px]:w-11"
                          aria-label={`Remove ${item.name} from wishlist`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Wishlist;
