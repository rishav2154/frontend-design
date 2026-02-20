import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Grid3X3,
  Grid2X2,
  SlidersHorizontal,
  Search,
  X
} from 'lucide-react';

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { ProductCard } from '@/components/products/ProductCard';

import { useProducts, categories } from '@/hooks/useProducts';

import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ProductGridSkeleton } from '@/components/ui/product-skeleton';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [gridCols, setGridCols] = useState<3 | 4>(4);
  const [showFilters, setShowFilters] = useState(false);
  
  // Initialize filters from URL params
  const [priceRange, setPriceRange] = useState([
    Number(searchParams.get('minPrice')) || 0,
    Number(searchParams.get('maxPrice')) || 1000
  ]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const selectedCategory = searchParams.get('category') || '';

  const { data: products = [], isLoading } = useProducts();
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Debounced URL updates
  const updateSearchParams = useCallback((updates: Record<string, string | null>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      const newParams = new URLSearchParams(searchParams);
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === '') {
          newParams.delete(key);
        } else {
          newParams.set(key, String(value));
        }
      });
      setSearchParams(newParams, { replace: true });
    }, 400);
  }, [searchParams, setSearchParams]);

  // Sync URL changes back to local state
  useEffect(() => {
    setSearchQuery(searchParams.get('search') || '');
    setPriceRange([
      Number(searchParams.get('minPrice')) || 0,
      Number(searchParams.get('maxPrice')) || 1000
    ]);
  }, [searchParams]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      const matchesSearch = !searchQuery.trim() ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesPrice && matchesSearch;
    });
  }, [products, selectedCategory, priceRange, searchQuery]);

  // Move custom product to top
  const finalProducts = useMemo(() => {
    if (!filteredProducts.length) return [];

    const sorted = [...filteredProducts];
    const customIndex = sorted.findIndex(product =>
      product.id === "customize-phone-cover" || product.category === "custom"
    );

    if (customIndex !== -1) {
      const customProduct = sorted.splice(customIndex, 1)[0];
      customProduct.isCustom = true;
      sorted.unshift(customProduct);
    }

    return sorted;
  }, [filteredProducts]);

  const handleCategoryChange = (categoryId: string) => {
    updateSearchParams({ 
      category: categoryId === selectedCategory ? null : categoryId 
    });
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    updateSearchParams({ search: value || null });
  };

  const handlePriceChange = (value: [number, number]) => {
    setPriceRange(value);
    updateSearchParams({
      minPrice: value[0].toString(),
      maxPrice: value[1].toString()
    });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setPriceRange([0, 1000]);
    updateSearchParams({
      search: null,
      category: null,
      minPrice: null,
      maxPrice: null
    });
    setShowFilters(false);
  };

  const gridClassName = useMemo(() => {
    return gridCols === 3 ? 'grid-cols-3' : 'grid-cols-4';
  }, [gridCols]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CartDrawer />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8">
          {/* HEADER */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <span className="text-accent font-medium text-sm uppercase tracking-wider">
              Shop Our Collection
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mt-4">
              {selectedCategory
                ? categories.find(c => c.id === selectedCategory)?.name || 'All Products'
                : 'All Products'
              }
            </h1>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
              Explore our curated selection of premium personalized gifts
            </p>
          </motion.div>

          <div className="flex gap-8">
            {/* SIDEBAR */}
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden lg:block w-64 flex-shrink-0"
            >
              <div className="glass-card p-6 sticky top-28">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-semibold flex gap-2 items-center">
                    <SlidersHorizontal className="w-5 h-5" />
                    Filters
                  </h3>
                  {(searchQuery || selectedCategory || priceRange[0] > 0 || priceRange[1] < 1000) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-xs h-6 px-2"
                    >
                      Clear All
                    </Button>
                  )}
                </div>

                {/* CATEGORY */}
                <div className="mb-8">
                  <h4 className="text-sm font-medium mb-4 text-muted-foreground">
                    Categories
                  </h4>
                  <div className="space-y-2">
                    {categories.map(category => (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryChange(category.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                          selectedCategory === category.id
                            ? 'bg-accent text-accent-foreground font-medium'
                            : 'hover:bg-muted'
                        }`}
                      >
                        {category.icon}
                        <span>{category.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* SEARCH */}
                <div className="mb-8">
                  <h4 className="text-sm font-medium mb-4 text-muted-foreground">
                    Search
                  </h4>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
                    <Input
                      value={searchQuery}
                      onChange={e => handleSearchChange(e.target.value)}
                      className="pl-9 h-10"
                      placeholder="Search products..."
                    />
                  </div>
                </div>

                {/* PRICE */}
                <div>
                  <h4 className="text-sm font-medium mb-4 text-muted-foreground">
                    Price Range
                  </h4>
                  <div className="text-xs text-muted-foreground mb-2">
                    ₹{priceRange[0]} - ₹{priceRange[1]}
                  </div>
                  <Slider
                    value={priceRange}
                    onValueChange={handlePriceChange}
                    max={1000}
                    step={10}
                    className="w-full"
                  />
                </div>
              </div>
            </motion.aside>

            {/* MAIN CONTENT */}
            <div className="flex-1">
              {/* MOBILE FILTERS BUTTON */}
              <div className="lg:hidden mb-6">
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <span className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4" />
                    Filters
                  </span>
                  {showFilters ? <X className="w-4 h-4" /> : null}
                </Button>
              </div>

              {/* MOBILE FILTERS PANEL */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="lg:hidden mb-6 p-6 bg-muted/50 backdrop-blur-sm rounded-xl space-y-6"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-lg flex gap-2 items-center">
                        <SlidersHorizontal className="w-5 h-5" />
                        Filters
                      </h3>
                      {(searchQuery || selectedCategory || priceRange[0] > 0 || priceRange[1] < 1000) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearFilters}
                          className="text-xs h-6 px-2"
                        >
                          Clear All
                        </Button>
                      )}
                    </div>

                    {/* Mobile Category */}
                    <div>
                      <h4 className="text-sm font-medium mb-4 text-muted-foreground">
                        Categories
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {categories.map(category => (
                          <button
                            key={category.id}
                            onClick={() => handleCategoryChange(category.id)}
                            className={`p-3 rounded-lg text-sm transition-colors flex flex-col items-center gap-1 ${
                              selectedCategory === category.id
                                ? 'bg-accent text-accent-foreground font-medium'
                                : 'hover:bg-muted'
                            }`}
                          >
                            {category.icon}
                            <span className="text-xs">{category.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Mobile Search */}
                    <div>
                      <h4 className="text-sm font-medium mb-4 text-muted-foreground">
                        Search
                      </h4>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
                        <Input
                          value={searchQuery}
                          onChange={e => handleSearchChange(e.target.value)}
                          className="pl-9 h-10"
                          placeholder="Search products..."
                        />
                      </div>
                    </div>

                    {/* Mobile Price */}
                    <div>
                      <h4 className="text-sm font-medium mb-4 text-muted-foreground">
                        Price Range
                      </h4>
                      <div className="text-xs text-muted-foreground mb-2">
                        ₹{priceRange[0]} - ₹{priceRange[1]}
                      </div>
                      <Slider
                        value={priceRange}
                        onValueChange={handlePriceChange}
                        max={1000}
                        step={10}
                        className="w-full"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* CONTROLS */}
              <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center glass-card p-4">
                <p className="text-sm text-muted-foreground">
                  Showing <span className="font-semibold">{finalProducts.length}</span> of{' '}
                  <span className="font-semibold">{products.length}</span> products
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setGridCols(3)}
                    className={`p-2 rounded-lg transition-colors ${
                      gridCols === 3 ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'
                    }`}
                  >
                    <Grid2X2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setGridCols(4)}
                    className={`p-2 rounded-lg transition-colors ${
                      gridCols === 4 ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'
                    }`}
                  >
                    <Grid3X3 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* PRODUCT GRID */}
              {isLoading ? (
                <ProductGridSkeleton count={8} />
              ) : (
                <motion.div
                  layout
                  className={`grid gap-6 ${gridClassName}`}
                  key={gridClassName}
                >
                  <AnimatePresence>
                    {finalProducts.map((product: any, index) => {
                      const isCustom =
                        product.isCustom ||
                        product.id === "customize-phone-cover" ||
                        product.category === "custom";

                      return isCustom ? (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          whileHover={{ scale: 1.05 }}
                          className="relative"
                          layout
                        >
                          <div className="absolute top-3 left-3 z-20 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
                            Customize Now
                          </div>
                          <Link
                            to="/customize-phone-cover"
                            className="block ring-2 ring-pink-500/40 rounded-xl hover:ring-pink-500/60 transition-all"
                          >
                            <ProductCard product={product} index={index} />
                          </Link>
                        </motion.div>
                      ) : (
                        <ProductCard
                          key={product.id}
                          product={product}
                          index={index}
                        />
                      );
                    })}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Shop;
