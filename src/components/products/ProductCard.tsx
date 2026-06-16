import { forwardRef } from "react";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCartStore } from "@/store/cartStore";
import type { Product } from "@/hooks/useProducts";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export const ProductCard = forwardRef<HTMLDivElement, ProductCardProps>(
  ({ product, index = 0 }, ref) => {
    const { isInWishlist, toggleItem } = useWishlistStore();
    const addItem = useCartStore((state) => state.addItem);
    const openCart = useCartStore((state) => state.openCart);
    const inWishlist = isInWishlist(product.id);

    /* ---------------- ADD TO CART ---------------- */
    const handleAddToCart = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!product?.id || !product?.name) {
        toast.error("Product not loaded properly");
        return;
      }

      const price = Number(product.price);

      if (isNaN(price) || price <= 0) {
        toast.error("Invalid product price");
        return;
      }

      const image =
        Array.isArray(product.images) && product.images.length > 0
          ? product.images[0]
          : "/placeholder.svg";

      addItem({
        productId: product.id,
        name: product.name,
        price,
        quantity: 1,
        image,
      });

      toast.success("Added to cart");
      openCart();
    };

    /* ---------------- WISHLIST ---------------- */
    const handleToggleWishlist = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      toggleItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || "/placeholder.svg",
        category: product.category,
      });

      toast.success(
        inWishlist ? "Removed from wishlist" : "Added to wishlist"
      );
    };

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1, duration: 0.5 }}
      >
        <Link to={`/product/${product.id}`}>
          <motion.div
            whileHover={{ y: -8 }}
            className="glass-card-hover group cursor-pointer overflow-hidden rounded-2xl"
          >
            {/* IMAGE */}
            <div className="relative aspect-square overflow-hidden">
              <motion.img
                src={product.images?.[0] || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* BADGES */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isCustomizable && (
                  <span className="px-3 py-1 text-xs font-medium bg-accent text-accent-foreground rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Customizable
                  </span>
                )}
                {product.originalPrice && (
                  <span className="px-3 py-1 text-xs font-medium bg-destructive text-destructive-foreground rounded-full">
                    Sale
                  </span>
                )}
              </div>

              {/* WISHLIST BUTTON */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleToggleWishlist}
                className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  inWishlist
                    ? "bg-accent text-accent-foreground"
                    : "bg-background/50 backdrop-blur-sm text-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <Heart
                  className={`w-5 h-5 ${inWishlist ? "fill-current" : ""}`}
                />
              </motion.button>

              {/* QUICK ADD */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                className="absolute bottom-4 left-4 right-4 py-3 rounded-xl bg-background/90 backdrop-blur-sm text-foreground font-medium text-sm flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-accent hover:text-accent-foreground"
              >
                <ShoppingBag className="w-4 h-4" />
                Add to Cart
              </motion.button>
            </div>

            {/* CONTENT */}
            <div className="p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-accent transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                    {product.description}
                  </p>
                </div>
              </div>

              {/* PRICE + RATING */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold">
                    ₹{Number(product.price).toFixed(2)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      ₹{Number(product.originalPrice).toFixed(2)}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-accent">★</span>
                  <span className="text-sm font-medium">
                    {product.rating}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({product.reviewCount})
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </Link>
      </motion.div>
    );
  }
);

ProductCard.displayName = "ProductCard";
