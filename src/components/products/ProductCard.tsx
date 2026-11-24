import { forwardRef, type MouseEvent, type SyntheticEvent } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Heart, ShoppingBag, Sparkles, WandSparkles } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useWishlistStore } from '@/store/wishlistStore';
import { useCartStore } from '@/store/cartStore';
import type { Product } from '@/hooks/useProducts';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
  index?: number;
}

const FALLBACK_IMAGE = '/placeholder.svg';

export const ProductCard = forwardRef<HTMLDivElement, ProductCardProps>(
  ({ product, index = 0 }, ref) => {
    const location = useLocation();
    const reduceMotion = useReducedMotion();
    const { isInWishlist, toggleItem } = useWishlistStore();
    const addItem = useCartStore((state) => state.addItem);
    const openCart = useCartStore((state) => state.openCart);
    const inWishlist = isInWishlist(product.id);
    const isLanding = location.pathname === '/';
    const isPhoneCase =
      product.category === 'phone-cover' ||
      product.id === 'customize-phone-cover' ||
      (product.category === 'custom' && product.name.toLocaleLowerCase().includes('phone cover'));
    const requiresPersonalization = product.isCustomizable;
    const isOutOfStock = product.stock <= 0;
    const hasSale =
      typeof product.originalPrice === 'number' &&
      Number.isFinite(product.originalPrice) &&
      product.originalPrice > product.price;
    const hasRating =
      typeof product.rating === 'number' &&
      typeof product.reviewCount === 'number' &&
      product.reviewCount > 0;
    const productHref = isPhoneCase
      ? `/customize-phone-cover?product=${encodeURIComponent(product.id)}`
      : `/product/${product.id}`;
    const actionLabel = isPhoneCase
      ? 'Choose model & customise'
      : requiresPersonalization
        ? 'View & personalise'
        : 'Add to Cart';
    const image =
      Array.isArray(product.images) &&
      typeof product.images[0] === 'string' &&
      product.images[0].trim().length > 0
        ? product.images[0]
        : FALLBACK_IMAGE;

    const handleImageError = (event: SyntheticEvent<HTMLImageElement>) => {
      const failedImage = event.currentTarget;
      failedImage.onerror = null;

      if (failedImage.getAttribute('src') !== FALLBACK_IMAGE) {
        failedImage.src = FALLBACK_IMAGE;
      }
    };

    const handleAddToCart = (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();

      if (isOutOfStock) {
        toast.error('This product is currently out of stock');
        return;
      }

      if (requiresPersonalization) return;

      if (!product?.id || !product?.name) {
        toast.error('Product not loaded properly');
        return;
      }

      const price = Number(product.price);

      if (Number.isNaN(price) || price <= 0) {
        toast.error('Invalid product price');
        return;
      }

      addItem({
        productId: product.id,
        name: product.name,
        price,
        quantity: 1,
        image,
      });

      toast.success('Added to cart');
      openCart();
    };

    const handleToggleWishlist = (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();

      toggleItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image,
        category: product.category,
      });

      toast.success(inWishlist ? 'Removed from wishlist' : 'Added to wishlist');
    };

    return (
      <motion.div
        ref={ref}
        initial={reduceMotion ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: reduceMotion ? 0 : Math.min(index, 5) * 0.07, duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.article
          whileHover={reduceMotion ? undefined : { y: -6 }}
          className={`group overflow-hidden ${
            isLanding
              ? 'home-product-card rounded-[1.5rem] transition-[border-color,box-shadow] duration-300'
              : 'glass-card-hover rounded-2xl'
          }`}
        >
          <div className="relative aspect-square overflow-hidden">
            <Link
              to={productHref}
              className="block h-full w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
              aria-label={`View ${product.name}`}
            >
              <motion.img
                src={image}
                alt={product.name}
                onError={handleImageError}
                className="h-full w-full object-cover transition-transform duration-700 motion-safe:group-hover:scale-105"
                loading="lazy"
              />
              <span
                className={`pointer-events-none absolute inset-0 bg-gradient-to-t transition-opacity duration-300 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 ${
                  isLanding
                    ? 'from-foreground/45 via-transparent to-transparent'
                    : 'from-background/80 via-transparent to-transparent'
                }`}
                aria-hidden="true"
              />
            </Link>

            <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-col gap-2 sm:left-4 sm:top-4">
              {product.isCustomizable && (
                <span
                  className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold sm:px-3 sm:text-xs ${
                    isLanding
                      ? 'bg-secondary text-secondary-foreground'
                      : 'bg-accent text-accent-foreground'
                  }`}
                >
                  <Sparkles className="h-3 w-3" aria-hidden="true" />
                  Customizable
                </span>
              )}
              {hasSale && (
                <span className="w-fit rounded-full bg-destructive px-2.5 py-1 text-[10px] font-medium text-destructive-foreground sm:px-3 sm:text-xs">
                  Sale
                </span>
              )}
            </div>

            <motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleToggleWishlist}
              className={`absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full shadow-sm transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 sm:right-4 sm:top-4 ${
                  isLanding
                    ? inWishlist
                      ? 'border border-accent/40 bg-accent text-accent-foreground shadow-[0_10px_30px_rgb(var(--home-accent-rgb)/0.2)]'
                      : 'border border-white/[0.16] bg-black/35 text-white backdrop-blur-xl hover:border-accent/40 hover:bg-accent hover:text-accent-foreground'
                    : inWishlist
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-background/70 text-foreground backdrop-blur-sm hover:bg-accent hover:text-accent-foreground'
              }`}
              aria-label={`${inWishlist ? 'Remove' : 'Add'} ${product.name} ${inWishlist ? 'from' : 'to'} wishlist`}
              aria-pressed={inWishlist}
            >
              <Heart className={`h-5 w-5 ${inWishlist ? 'fill-current' : ''}`} aria-hidden="true" />
            </motion.button>

            {requiresPersonalization ? (
              <Link
                to={productHref}
                className={`absolute bottom-3 left-3 right-3 z-20 flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-center text-xs font-semibold shadow-lg backdrop-blur-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 sm:bottom-4 sm:left-4 sm:right-4 sm:translate-y-2 sm:text-sm sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 sm:group-focus-within:translate-y-0 sm:group-focus-within:opacity-100 ${
                  isLanding
                    ? 'border border-white/[0.16] bg-black/55 text-white shadow-[0_12px_36px_rgba(0,0,0,0.32)] hover:border-accent/50 hover:bg-accent hover:text-accent-foreground'
                    : 'bg-background/90 text-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
                aria-label={`${actionLabel} for ${product.name}`}
              >
                <WandSparkles className="h-4 w-4" aria-hidden="true" />
                {actionLabel}
              </Link>
            ) : (
              <motion.button
                type="button"
                whileHover={isOutOfStock ? undefined : { scale: 1.02 }}
                whileTap={isOutOfStock ? undefined : { scale: 0.98 }}
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`absolute bottom-3 left-3 right-3 z-20 flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold shadow-lg backdrop-blur-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-80 sm:bottom-4 sm:left-4 sm:right-4 sm:translate-y-2 sm:text-sm sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 sm:group-focus-within:translate-y-0 sm:group-focus-within:opacity-100 ${
                  isLanding
                    ? 'border border-white/[0.16] bg-black/55 text-white shadow-[0_12px_36px_rgba(0,0,0,0.32)] hover:border-accent/50 hover:bg-accent hover:text-accent-foreground'
                    : 'bg-background/90 text-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
                aria-label={isOutOfStock ? `${product.name} is out of stock` : `Add ${product.name} to cart`}
              >
                <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                {isOutOfStock ? 'Out of stock' : actionLabel}
              </motion.button>
            )}
          </div>

          <div className="p-3 sm:p-5">
            <Link
              to={productHref}
              className="block rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              <h3
                className="line-clamp-1 text-sm font-semibold transition-colors group-hover:text-accent"
              >
                {product.name}
              </h3>
              <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                {product.description}
              </p>
            </Link>

            <div className="mt-3 flex flex-col gap-2 sm:mt-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex min-w-0 flex-wrap items-baseline gap-x-2">
                <span className="text-base font-bold sm:text-lg">
                  ₹{Number(product.price).toFixed(2)}
                </span>
                {hasSale && (
                  <span className="text-xs text-muted-foreground line-through sm:text-sm">
                    ₹{Number(product.originalPrice).toFixed(2)}
                  </span>
                )}
              </div>

              {hasRating && (
                <div
                  className="flex shrink-0 items-center gap-1"
                  aria-label={`Rated ${product.rating} out of 5 from ${product.reviewCount} reviews`}
                >
                  <span className="text-accent" aria-hidden="true">★</span>
                  <span className="text-xs font-medium sm:text-sm" aria-hidden="true">{product.rating}</span>
                  <span className="text-[10px] text-muted-foreground sm:text-xs" aria-hidden="true">
                    ({product.reviewCount})
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.article>
      </motion.div>
    );
  },
);

ProductCard.displayName = 'ProductCard';
