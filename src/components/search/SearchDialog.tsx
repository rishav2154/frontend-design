import { useEffect, useMemo, useState, type SyntheticEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, Search, X, ArrowRight, Sparkles } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import {
  getPopulatedProductCategories,
  productCategoryMatchesSearch,
} from '@/lib/productTaxonomy';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FALLBACK_IMAGE = '/placeholder.svg';

export const SearchDialog = ({ open, onOpenChange }: SearchDialogProps) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const {
    data: products = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useProducts();

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  const populatedCategories = useMemo(
    () =>
      getPopulatedProductCategories(
        products.map((product) => product.category),
      ),
    [products],
  );

  const searchResults = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    if (!normalizedQuery) return { products: [], categories: [] };

    const matchedProducts = products
      .filter(
        (product) =>
          product.name.toLocaleLowerCase().includes(normalizedQuery) ||
          product.description.toLocaleLowerCase().includes(normalizedQuery) ||
          product.tags.some((tag) =>
            tag.toLocaleLowerCase().includes(normalizedQuery),
          ),
      )
      .slice(0, 5);

    const matchedCategories = populatedCategories.filter((category) =>
      productCategoryMatchesSearch(category, normalizedQuery),
    );

    return { products: matchedProducts, categories: matchedCategories };
  }, [query, products, populatedCategories]);

  const handleProductClick = (productId: string) => {
    onOpenChange(false);
    navigate(`/product/${encodeURIComponent(productId)}`);
  };

  const handleCategoryClick = (categoryId: string) => {
    onOpenChange(false);
    navigate(`/shop?category=${encodeURIComponent(categoryId)}`);
  };

  const handleImageError = (event: SyntheticEvent<HTMLImageElement>) => {
    const image = event.currentTarget;
    image.onerror = null;
    image.src = FALLBACK_IMAGE;
  };

  const hasResults =
    searchResults.products.length > 0 ||
    searchResults.categories.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="storefront-glass-dialog gap-0 overflow-hidden p-0 sm:max-w-2xl"
        aria-describedby={undefined}
      >
        <DialogTitle className="sr-only">Search Products</DialogTitle>

        {/* Search Input */}
        <div className="flex min-w-0 items-center gap-3 border-b border-border p-4 pr-16">
          <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Search products and categories"
            placeholder="Search products, categories..."
            className="min-w-0 flex-1 border-none bg-transparent text-base outline-none placeholder:text-muted-foreground sm:text-lg"
            autoFocus
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setQuery('')}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-10 sm:w-10"
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
          ) : isError ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
              role="alert"
            >
              <AlertCircle className="w-10 h-10 mx-auto text-destructive mb-4" />
              <p className="font-medium">Search is temporarily unavailable.</p>
              <p className="text-sm text-muted-foreground mt-2">
                {error?.message || 'Please try again.'}
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                disabled={isFetching}
                className="mt-4 text-accent hover:underline disabled:opacity-60"
              >
                {isFetching ? 'Trying again…' : 'Try again'}
              </button>
            </motion.div>
          ) : !hasResults ? (
            <motion.div
              key="no-results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <p className="text-muted-foreground">
                No results found for &quot;{query}&quot;
              </p>
              <button
                type="button"
                onClick={() => {
                  onOpenChange(false);
                  navigate('/shop');
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
                        type="button"
                        key={category.id}
                        onClick={() => handleCategoryClick(category.id)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left"
                      >
                        <span className="text-2xl">{category.icon}</span>
                        <div className="flex-1">
                          <p className="font-medium">{category.label}</p>
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
                        type="button"
                        key={product.id}
                        onClick={() => handleProductClick(product.id)}
                        className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-muted transition-colors text-left"
                      >
                        {/* Image */}
                        <img
                          src={product.images[0] || FALLBACK_IMAGE}
                          onError={handleImageError}
                          alt={product.name}
                          className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                        />

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-base line-clamp-1">
                              {product.name}
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
                          {product.originalPrice !== undefined && (
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
                type="button"
                onClick={() => {
                  onOpenChange(false);
                  navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
                }}
                className="w-full py-3 text-center text-accent hover:underline flex items-center justify-center gap-2"
              >
                View all results for &quot;{query}&quot;
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
