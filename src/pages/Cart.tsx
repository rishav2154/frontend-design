import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { CouponInput } from '@/components/cart/CouponInput';
import { useCartStore } from '@/store/cartStore';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';

import productTshirt from '@/assets/product-tshirt.jpg';
import productMug from '@/assets/product-mug.jpg';
import productFrame from '@/assets/product-frame.jpg';
import productPhone from '@/assets/product-phone.jpg';
import productPoster from '@/assets/product-poster.jpg';
import productCombo from '@/assets/product-combo.jpg';

const categoryImages: Record<string, string> = {
  tshirts: productTshirt,
  mugs: productMug,
  frames: productFrame,
  'phone-covers': productPhone,
  posters: productPoster,
  combos: productCombo,
};

const Cart = () => {
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart, appliedCoupon, appliedCoupons, getDiscount } = useCartStore();

  const getItemImage = (item: typeof items[0]) => {
    if (item.image && item.image !== '/placeholder.svg') {
      return item.image;
    }
    for (const [category, image] of Object.entries(categoryImages)) {
      if (item.name.toLowerCase().includes(category.replace('-', ' '))) {
        return image;
      }
    }
    return productTshirt;
  };

  const subtotal = getTotalPrice();
  const discount = getDiscount();
  const discountedSubtotal = subtotal - discount;
  const activeCoupons = appliedCoupons.length
    ? appliedCoupons
    : appliedCoupon
      ? [appliedCoupon]
      : [];
  const shipping = activeCoupons.some((coupon) => coupon.discountType === 'free_shipping') || subtotal > 500 ? 0 : 50;
  const gst = discountedSubtotal * 0.08;
  const total = discountedSubtotal + shipping + gst;

  return (
    <div className="min-h-dvh min-h-dvh overflow-x-clip bg-background">
      <Navbar />
      <CartDrawer />

      <main className="pb-12 pt-20 sm:pb-16 sm:pt-24">
        <div className="container mx-auto px-3 min-[360px]:px-4 lg:px-8">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 text-center sm:mb-12"
          >
            <h1 className="text-3xl font-bold min-[360px]:text-4xl md:text-5xl">
              Your <span className="text-gradient-accent">Cart</span>
            </h1>
            <p className="text-muted-foreground mt-4">
              {items.length === 0
                ? 'Your cart is empty'
                : `You have ${items.length} item${items.length > 1 ? 's' : ''} in your cart`}
            </p>
          </motion.div>

          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-12 text-center sm:py-16"
            >
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted sm:h-24 sm:w-24">
                <ShoppingBag className="h-10 w-10 text-muted-foreground sm:h-12 sm:w-12" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Your cart is empty</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Looks like you haven't added any personalized gifts yet. Start exploring our collection!
              </p>
              <Link to="/shop" className="btn-luxury inline-flex min-h-11 items-center justify-center gap-2 px-5 py-3 sm:px-8 sm:py-4">
                Start Shopping
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          ) : (
            <div className="grid min-w-0 gap-6 lg:grid-cols-3 lg:gap-8">
              {/* Cart Items */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="min-w-0 space-y-4 lg:col-span-2"
              >
                {items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass-card flex min-w-0 flex-col gap-4 p-4 min-[380px]:flex-row min-[380px]:gap-5 sm:gap-6 sm:p-6"
                  >
                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-muted min-[380px]:h-28 min-[380px]:w-28">
                      <img
                        src={getItemImage(item)}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="break-words font-semibold">{item.name}</h3>
                          {item.customization && (
                            <div className="mt-1 space-y-1 text-sm">
                              <p className="text-accent">✨ Customized</p>
                              {(item.customization.brand || item.customization.model || item.customization.coverType) && (
                                <p className="text-xs text-muted-foreground">
                                  {[item.customization.brand, item.customization.model, item.customization.coverType]
                                    .filter(Boolean)
                                    .join(' · ')}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => removeItem(item.id)}
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                          aria-label={`Remove ${item.name} from cart`}
                        >
                          <Trash2 className="w-5 h-5" />
                        </motion.button>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 sm:mt-4">
                        <div className="flex items-center gap-1 min-[360px]:gap-2 sm:gap-3">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="flex h-11 w-11 items-center justify-center rounded-lg bg-muted transition-colors hover:bg-muted/80"
                            aria-label={`Decrease quantity of ${item.name}`}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-7 text-center font-medium min-[360px]:w-8" aria-label={`Quantity ${item.quantity}`}>{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="flex h-11 w-11 items-center justify-center rounded-lg bg-muted transition-colors hover:bg-muted/80"
                            aria-label={`Increase quantity of ${item.name}`}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="break-words text-lg font-bold min-[360px]:text-xl">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}

                <button
                  onClick={clearCart}
                  className="min-h-11 px-1 text-sm text-muted-foreground transition-colors hover:text-destructive"
                >
                  Clear all items
                </button>
              </motion.div>

              {/* Order Summary */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="min-w-0"
              >
                <div className="glass-card p-4 min-[360px]:p-5 sm:p-6 lg:sticky lg:top-28">
                  <h3 className="text-lg font-semibold mb-6">Order Summary</h3>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex min-w-0 justify-between gap-3 text-sm">
                        <span className="min-w-0 break-words text-green-500">Discount ({activeCoupons.map((coupon) => coupon.code).join(', ')})</span>
                        <span className="shrink-0 text-green-500">-₹{discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className={shipping === 0 ? 'text-green-500' : ''}>
                        {shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">GST (8%)</span>
                      <span>₹{gst.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Coupon */}
                  <div className="mb-6">
                    <CouponInput />
                  </div>

                  <div className="border-t border-border pt-4 mb-6">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="font-semibold">Total</span>
                      <span className="min-w-0 break-words text-right text-xl font-bold min-[360px]:text-2xl">
                        ₹{total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <Link to="/checkout" className="block">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="btn-luxury flex min-h-11 w-full items-center justify-center gap-2 px-4 py-3 sm:px-8 sm:py-4"
                    >
                      Proceed to Checkout
                      <ArrowRight className="w-5 h-5" />
                    </motion.button>
                  </Link>

                  <Link
                    to="/shop"
                    className="mt-3 flex min-h-11 items-center justify-center text-center text-sm text-muted-foreground transition-colors hover:text-foreground sm:mt-4"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cart;
