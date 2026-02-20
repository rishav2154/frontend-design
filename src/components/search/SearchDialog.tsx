import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, X, ArrowRight, Sparkles } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/* ✅ Categories aligned with DATABASE */
const categories = [
  { id: "magic-cup", name: "Mugs", icon: "☕", description: "Custom printed mugs" },
  { id: "photo-frame", name: "Frames", icon: "🖼️", description: "Personalized frames" },
  { id: "phone-cover", name: "Phone Cases", icon: "📱", description: "Customized phone covers" },
  { id: "keychain", name: "Keychains", icon: "🔑", description: "Custom keychains" },
  { id: "night-lamp", name: "Lamps", icon: "💡", description: "LED night lamps" },
  { id: "custom", name: "Custom", icon: "✨", description: "Customizable products" },
];

export const SearchDialog = ({ open, onOpenChange }: SearchDialogProps) => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const { data: products = [], isLoading } = useProducts();

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const searchResults = useMemo(() => {
    if (!query.trim()) return { products: [], categories: [] };

    const lowerQuery = query.toLowerCase();

    const matchedProducts = products
      .filter((product) =>
        product.name?.toLowerCase().includes(lowerQuery) ||
        product.description?.toLowerCase().includes(lowerQuery) ||
        product.tags?.some((tag) =>
          tag.toLowerCase().includes(lowerQuery)
        )
      )
      .slice(0, 5);

    const matchedCategories = categories.filter(
      (category) =>
        category.name.toLowerCase().includes(lowerQuery) ||
        category.description.toLowerCase().includes(lowerQuery)
    );

    return { products: matchedProducts, categories: matchedCategories };
  }, [query, products]);

  const handleProductClick = (productId: string) => {
    onOpenChange(false);
    navigate(`/product/${productId}`);
  };

  const handleCategoryClick = (categoryId: string) => {
    onOpenChange(false);
    navigate(`/shop?category=${categoryId}`);
  };

  const hasResults =
    searchResults.products.length > 0 ||
    searchResults.categories.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-2xl p-0 gap-0 overflow-hidden"
        aria-describedby={undefined}
      >
        <DialogTitle className="sr-only">Search Products</DialogTitle>

        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, categories..."
            className="flex-1 bg-transparent border-none outline-none text-lg placeholder:text-muted-foreground"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto p-4">
          {!query.trim() ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Search className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                Start typing to search...
              </p>
            </motion.div>
          ) : isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading...
            </div>
          ) : !hasResults ? (
            <motion.div
              key="no-results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <p className="text-muted-foreground">
                No results found for "{query}"
              </p>
              <button
                onClick={() => {
                  onOpenChange(false);
                  navigate("/shop");
                }}
                className="mt-4 text-accent hover:underline inline-flex items-center gap-1"
              >
                Browse all products
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Categories */}
              {searchResults.categories.length > 0 && (
                <div>
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                    Categories
                  </h3>
                  <div className="space-y-1">
                    {searchResults.categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() =>
                          handleCategoryClick(category.id)
                        }
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left"
                      >
                        <span className="text-2xl">
                          {category.icon}
                        </span>
                        <div className="flex-1">
                          <p className="font-medium">
                            {category.name}
                          </p>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {category.description}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Products */}
              {searchResults.products.length > 0 && (
                <div>
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                    Products
                  </h3>
                  <div className="space-y-1">
                    {searchResults.products.map((product) => (
                      <button
                        key={product.id}
                        onClick={() =>
                          handleProductClick(product.id)
                        }
                        className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-muted transition-colors text-left"
                      >
                        {/* Image */}
                        <img
                          src={product.images?.[0] || "/placeholder.svg"}
                          alt={product.name}
                          className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                        />

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-base line-clamp-1">
                              {product.name || "Unnamed Product"}
                            </h4>
                            {product.isCustomizable && (
                              <Sparkles className="w-3 h-3 text-accent flex-shrink-0" />
                            )}
                          </div>

                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {product.description}
                          </p>
                        </div>

                        {/* Price */}
                        <div className="text-right flex-shrink-0">
                          <p className="font-bold text-base">
                            ₹{product.price.toFixed(2)}
                          </p>
                          {product.originalPrice && (
                            <p className="text-xs text-muted-foreground line-through">
                              ₹{product.originalPrice.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* View All */}
              <button
                onClick={() => {
                  onOpenChange(false);
                  navigate(
                    `/shop?search=${encodeURIComponent(query)}`
                  );
                }}
                className="w-full py-3 text-center text-accent hover:underline flex items-center justify-center gap-2"
              >
                View all results for "{query}"
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
