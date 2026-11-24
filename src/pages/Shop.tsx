import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  Filter,
  Grid3X3,
  Grid2X2,
  SlidersHorizontal,
  X,
  Search,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { ProductCard } from '@/components/products/ProductCard';
import { useProducts } from '@/hooks/useProducts';
import { usePhoneCoverCatalog } from '@/hooks/usePhoneCoverCatalog';
import {
  getPopulatedProductCategories,
  getProductCategory,
  normalizeProductCategory,
} from '@/lib/productTaxonomy';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { ProductGridSkeleton } from '@/components/ui/product-skeleton';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

const PRICE_STEP = 10;

const roundPriceCeiling = (price: number): number =>
  Math.max(PRICE_STEP, Math.ceil(price / PRICE_STEP) * PRICE_STEP);

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [gridCols, setGridCols] = useState<3 | 4>(4);
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number] | null>(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  const categoryParam = searchParams.get('category') || '';
  const selectedCategory = categoryParam
    ? normalizeProductCategory(categoryParam)
    : '';
  const selectedPhoneBrand = searchParams.get('brand') || '';
  const selectedPhoneModel = searchParams.get('model') || '';
  const selectedCoverType = searchParams.get('type') || '';
  const { data: products = [], isLoading, isError, error, refetch, isFetching } = useProducts();
  const { data: phoneCatalog } = usePhoneCoverCatalog();

  const phoneBrandModelIds = useMemo(
    () => new Set(
      (phoneCatalog?.models || [])
        .filter((model) => !selectedPhoneBrand || model.brand_id === selectedPhoneBrand)
        .map((model) => model.id),
    ),
    [phoneCatalog, selectedPhoneBrand],
  );
  const phoneModels = useMemo(
    () => (phoneCatalog?.models || []).filter(
      (model) => !selectedPhoneBrand || model.brand_id === selectedPhoneBrand,
    ),
    [phoneCatalog, selectedPhoneBrand],
  );

  const priceCeiling = useMemo(
    () => roundPriceCeiling(Math.max(0, ...products.map((product) => product.price))),
    [products],
  );
  const activePriceRange = useMemo<[number, number]>(
    () => priceRange ?? [0, priceCeiling],
    [priceRange, priceCeiling],
  );
  const hasPriceFilter =
    priceRange !== null &&
    (priceRange[0] > 0 || priceRange[1] < priceCeiling);

  useEffect(() => {
    setSearchQuery(searchParams.get('search') || '');
  }, [searchParams]);

  useEffect(() => {
    setPriceRange((currentRange) => {
      if (currentRange === null) return currentRange;

      const [minimum, maximum] = currentRange;
      const nextMinimum = Math.min(minimum, priceCeiling);
      const nextMaximum = Math.min(maximum, priceCeiling);

      if (nextMinimum === minimum && nextMaximum === maximum) {
        return currentRange;
      }

      return [Math.min(nextMinimum, nextMaximum), Math.max(nextMinimum, nextMaximum)];
    });
  }, [priceCeiling]);

  const categoryOptions = useMemo(() => {
    const populatedCategories = getPopulatedProductCategories(
      products.map((product) => product.category),
    );

    if (
      selectedCategory &&
      !populatedCategories.some((category) => category.id === selectedCategory)
    ) {
      return [...populatedCategories, getProductCategory(selectedCategory)].sort(
        (left, right) =>
          left.order - right.order || left.label.localeCompare(right.label),
      );
    }

    return populatedCategories;
  }, [products, selectedCategory]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLocaleLowerCase();

    return products.filter((product) => {
      const matchesCategory =
        !selectedCategory || product.category === selectedCategory;
      const matchesPrice =
        product.price >= activePriceRange[0] &&
        product.price <= activePriceRange[1];
      const matchesSearch =
        !normalizedSearch ||
        product.name.toLocaleLowerCase().includes(normalizedSearch) ||
        product.description.toLocaleLowerCase().includes(normalizedSearch) ||
        product.tags.some((tag) =>
          tag.toLocaleLowerCase().includes(normalizedSearch),
        );

      let matchesPhoneCatalog = true;
      if (selectedCategory === 'phone-cover' && phoneCatalog) {
        const catalogProduct = phoneCatalog.products.find((entry) => entry.id === product.id);
        if (catalogProduct) {
          const supportsAllModels = catalogProduct.supported_model_ids.length === 0;
          const matchesBrand =
            !selectedPhoneBrand ||
            supportsAllModels ||
            catalogProduct.supported_model_ids.some((id) => phoneBrandModelIds.has(id));
          const matchesModel =
            !selectedPhoneModel ||
            supportsAllModels ||
            catalogProduct.supported_model_ids.includes(selectedPhoneModel);
          const matchesType =
            !selectedCoverType || catalogProduct.cover_type_id === selectedCoverType;
          matchesPhoneCatalog = matchesBrand && matchesModel && matchesType;
        }
      }

      return matchesCategory && matchesPrice && matchesSearch && matchesPhoneCatalog;
    });
  }, [
    products,
    selectedCategory,
    activePriceRange,
    searchQuery,
    phoneCatalog,
    phoneBrandModelIds,
    selectedPhoneBrand,
    selectedPhoneModel,
    selectedCoverType,
  ]);

  const updateSearchParams = (updates: Record<string, string | null>) => {
    const nextSearchParams = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        nextSearchParams.set(key, value);
      } else {
        nextSearchParams.delete(key);
      }
    });

    setSearchParams(nextSearchParams);
  };

  const handleCategoryChange = (categoryId: string) => {
    updateSearchParams({
      category: categoryId === selectedCategory ? null : categoryId,
      brand: null,
      model: null,
      type: null,
    });
  };

  const clearFilters = () => {
    updateSearchParams({ category: null, search: null, brand: null, model: null, type: null });
    setPriceRange(null);
    setSearchQuery('');
  };

  const handlePriceChange = (range: number[]) => {
    setPriceRange([range[0] ?? 0, range[1] ?? priceCeiling]);
  };

  const hasActiveFilters = Boolean(
    selectedCategory || hasPriceFilter || searchQuery.trim() || selectedPhoneBrand || selectedPhoneModel || selectedCoverType,
  );

  const selectedCategoryLabel = selectedCategory
    ? getProductCategory(selectedCategory).label
    : 'All Products';

  const displayProducts = useMemo(
    () => filteredProducts.map((product) => {
      if (product.category !== 'phone-cover' || !phoneCatalog) return product;
      const catalogProduct = phoneCatalog.products.find((entry) => entry.id === product.id);
      if (!catalogProduct) return product;
      const selectedModelOption = catalogProduct.models.find(
        (option) => option.model_id === selectedPhoneModel,
      );
      const modelStocks = catalogProduct.models
        .map((option) => option.stock_override)
        .filter((value): value is number => typeof value === 'number');
      return {
        ...product,
        price: selectedModelOption?.price_override ?? product.price,
        stock:
          selectedModelOption?.stock_override ??
          Math.max(product.stock, ...(modelStocks.length ? modelStocks : [product.stock])),
      };
    }),
    [filteredProducts, phoneCatalog, selectedPhoneModel],
  );

  const categoryFilter = (
    <div className="space-y-2">
      {categoryOptions.map((category) => (
        <button
          type="button"
          key={category.id}
          onClick={() => handleCategoryChange(category.id)}
          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
            selectedCategory === category.id
              ? 'bg-accent text-accent-foreground'
              : 'hover:bg-muted'
          }`}
        >
          <span className="mr-2">{category.icon}</span>
          {category.label}
        </button>
      ))}
    </div>
  );

  const priceFilter = (
    <>
      <Slider
        value={activePriceRange}
        onValueChange={handlePriceChange}
        max={priceCeiling}
        step={PRICE_STEP}
        aria-label="Price range"
        className="mb-4 py-2"
      />
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>₹{activePriceRange[0]}</span>
        <span>₹{activePriceRange[1]}</span>
      </div>
    </>
  );

  const phoneCoverFilter = selectedCategory === 'phone-cover' && phoneCatalog ? (
    <div className="space-y-4">
      <label className="block space-y-2 text-sm">
        <span className="font-medium text-muted-foreground">Phone Brand</span>
        <select
          value={selectedPhoneBrand}
          onChange={(event) => updateSearchParams({ brand: event.target.value || null, model: null })}
          className="h-10 w-full rounded-md border border-input bg-background px-3"
        >
          <option value="">All brands</option>
          {phoneCatalog.brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
        </select>
      </label>
      <label className="block space-y-2 text-sm">
        <span className="font-medium text-muted-foreground">Phone Model</span>
        <select
          value={selectedPhoneModel}
          onChange={(event) => updateSearchParams({ model: event.target.value || null })}
          className="h-10 w-full rounded-md border border-input bg-background px-3"
        >
          <option value="">All models</option>
          {phoneModels.map((model) => <option key={model.id} value={model.id}>{model.name}</option>)}
        </select>
      </label>
      <label className="block space-y-2 text-sm">
        <span className="font-medium text-muted-foreground">Cover Type</span>
        <select
          value={selectedCoverType}
          onChange={(event) => updateSearchParams({ type: event.target.value || null })}
          className="h-10 w-full rounded-md border border-input bg-background px-3"
        >
          <option value="">All cover types</option>
          {phoneCatalog.coverTypes.map((type) => <option key={type.id} value={type.id}>{type.name}</option>)}
        </select>
      </label>
    </div>
  ) : null;

  return (
    <div className="min-h-dvh bg-background">
      <Navbar />
      <CartDrawer />

      <main className="pt-20 sm:pt-24 pb-12 sm:pb-16">
        <div className="container mx-auto px-3 sm:px-4 lg:px-8">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6 sm:mb-8"
          >
            <span className="text-accent font-medium text-xs sm:text-sm tracking-wider uppercase">
              Shop Our Collection
            </span>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mt-2 sm:mt-4">
              {selectedCategoryLabel}
            </h1>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-xl mx-auto mb-6 sm:mb-10"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="pl-11 pr-10 h-12 rounded-full text-base bg-muted/50 border-border focus:bg-background"
              />
              {searchQuery && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>
          </motion.div>

          <div className="flex gap-8">
            {/* Sidebar Filters - Desktop */}
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden lg:block w-64 flex-shrink-0"
            >
              <div className="glass-card p-6 sticky top-28">
                <h3 className="font-semibold mb-6 flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5" />
                  Filters
                </h3>

                {/* Categories */}
                {categoryOptions.length > 0 && (
                  <div className="mb-8">
                    <h4 className="text-sm font-medium mb-4 text-muted-foreground">
                      Categories
                    </h4>
                    {categoryFilter}
                  </div>
                )}

                {phoneCoverFilter && (
                  <div className="mb-8">
                    <h4 className="mb-4 text-sm font-medium text-muted-foreground">
                      Phone Compatibility
                    </h4>
                    {phoneCoverFilter}
                  </div>
                )}

                {/* Search */}
                <div className="mb-8">
                  <h4 className="text-sm font-medium mb-4 text-muted-foreground">
                    Search
                  </h4>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-8">
                  <h4 className="text-sm font-medium mb-4 text-muted-foreground">
                    Price Range
                  </h4>
                  {priceFilter}
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="w-full py-2 text-sm text-accent hover:underline"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            </motion.aside>

            {/* Main Content */}
            <div className="min-w-0 flex-1">
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-4 sm:mb-6 p-3 sm:p-4 glass-card">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Showing{' '}
                  <span className="font-medium text-foreground">
                    {filteredProducts.length}
                  </span>{' '}
                  products
                </p>

                <div className="flex items-center gap-2 sm:gap-4">
                  {/* Mobile Filter Toggle */}
                  <button
                    type="button"
                    onClick={() => setShowFilters(true)}
                    className="lg:hidden flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-xs font-medium sm:text-sm"
                  >
                    <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Filters
                  </button>

                  {/* Grid Toggle */}
                  <div className="hidden sm:flex items-center gap-2 border-l border-border pl-4">
                    <button
                      type="button"
                      aria-label="Show three columns"
                      onClick={() => setGridCols(3)}
                      className={`p-2 rounded-lg transition-colors ${
                        gridCols === 3 ? 'bg-muted' : 'hover:bg-muted/50'
                      }`}
                    >
                      <Grid2X2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Show four columns"
                      onClick={() => setGridCols(4)}
                      className={`p-2 rounded-lg transition-colors ${
                        gridCols === 4 ? 'bg-muted' : 'hover:bg-muted/50'
                      }`}
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Products Grid */}
              {isLoading ? (
                <ProductGridSkeleton count={8} />
              ) : isError ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16 glass-card"
                  role="alert"
                >
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-destructive/10 flex items-center justify-center">
                    <AlertCircle className="w-10 h-10 text-destructive" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">
                    We could not load the products
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {error?.message || 'Please check your connection and try again.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => refetch()}
                    disabled={isFetching}
                    className="btn-luxury disabled:opacity-60"
                  >
                    {isFetching ? 'Trying again…' : 'Try Again'}
                  </button>
                </motion.div>
              ) : (
                <>
                  <motion.div
                    layout
                    className={`grid gap-3 sm:gap-6 ${
                      gridCols === 3
                        ? 'grid-cols-1 min-[360px]:grid-cols-2 lg:grid-cols-3'
                        : 'grid-cols-1 min-[360px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                    }`}
                  >
                    <AnimatePresence mode="popLayout">
                      {displayProducts.map((product, index) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          index={index}
                        />
                      ))}
                    </AnimatePresence>
                  </motion.div>

                  {/* Empty State */}
                  {filteredProducts.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-16"
                    >
                      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                        <Filter className="w-10 h-10 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">
                        No products found
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        Try adjusting your filters to see more results.
                      </p>
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="btn-luxury"
                      >
                        Clear Filters
                      </button>
                    </motion.div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Filters Drawer */}
      <Sheet open={showFilters} onOpenChange={setShowFilters}>
        <SheetContent
          side="left"
          className="flex w-[min(100%,22rem)] flex-col gap-0 overflow-y-auto border-r border-border bg-card p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:p-6 sm:pb-6 lg:hidden"
        >
          <SheetHeader className="mb-6 pr-12 text-left">
            <SheetTitle className="flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5" aria-hidden="true" />
              Filters
            </SheetTitle>
            <SheetDescription>
              Narrow the catalog by collection and price.
            </SheetDescription>
          </SheetHeader>

          {categoryOptions.length > 0 && (
            <div className="mb-8">
              <h4 className="mb-4 text-sm font-medium text-muted-foreground">
                Categories
              </h4>
              <div className="space-y-2">
                {categoryOptions.map((category) => (
                  <button
                    type="button"
                    key={category.id}
                    onClick={() => {
                      handleCategoryChange(category.id);
                      setShowFilters(false);
                    }}
                    className={`min-h-11 w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-accent text-accent-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <span className="mr-2" aria-hidden="true">{category.icon}</span>
                    {category.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {phoneCoverFilter && (
            <div className="mb-8">
              <h4 className="mb-4 text-sm font-medium text-muted-foreground">
                Phone Compatibility
              </h4>
              {phoneCoverFilter}
            </div>
          )}

          <div className="mb-8">
            <h4 className="mb-4 text-sm font-medium text-muted-foreground">
              Price Range
            </h4>
            {priceFilter}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                clearFilters();
                setShowFilters(false);
              }}
              className="min-h-11 w-full rounded-lg px-3 py-2 text-sm text-accent hover:bg-muted"
            >
              Clear All Filters
            </button>
          )}
        </SheetContent>
      </Sheet>

      <Footer />
    </div>
  );
};

export default Shop;
