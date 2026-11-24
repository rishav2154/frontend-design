import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Search,
  SlidersHorizontal,
  Sparkles,
  Smartphone,
} from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { usePhoneCoverCatalog } from '@/hooks/usePhoneCoverCatalog';
import type { PhoneCoverCatalogProduct } from '@/lib/phoneCoverCatalog';
import productPhoneFallback from '@/assets/product-phone.jpg';

const CustomizePhoneCover = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { data: catalog, isLoading, isError, refetch } = usePhoneCoverCatalog();

  const selectedBrandId = searchParams.get('brand') || '';
  const selectedModelId = searchParams.get('model') || '';
  const selectedTypeId = searchParams.get('type') || '';
  const selectedProductId = searchParams.get('product') || '';
  const search = searchParams.get('search') || '';

  const updateParams = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    setSearchParams(next);
  };

  const brandModelIds = useMemo(() => {
    if (!catalog || !selectedBrandId) return new Set<string>();
    return new Set(
      catalog.models
        .filter((model) => model.brand_id === selectedBrandId)
        .map((model) => model.id),
    );
  }, [catalog, selectedBrandId]);

  const availableModels = useMemo(
    () =>
      (catalog?.models || []).filter(
        (model) => !selectedBrandId || model.brand_id === selectedBrandId,
      ),
    [catalog, selectedBrandId],
  );

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();
    return (catalog?.products || []).filter((product) => {
      const supportsEverything = product.supported_model_ids.length === 0;
      const matchesBrand =
        !selectedBrandId ||
        supportsEverything ||
        product.supported_model_ids.some((id) => brandModelIds.has(id));
      const matchesModel =
        !selectedModelId ||
        supportsEverything ||
        product.supported_model_ids.includes(selectedModelId);
      const matchesType = !selectedTypeId || product.cover_type_id === selectedTypeId;
      const matchesSearch =
        !normalizedSearch ||
        product.name.toLocaleLowerCase().includes(normalizedSearch) ||
        product.description.toLocaleLowerCase().includes(normalizedSearch) ||
        product.tags.some((tag) => tag.toLocaleLowerCase().includes(normalizedSearch));
      return matchesBrand && matchesModel && matchesType && matchesSearch;
    });
  }, [brandModelIds, catalog, search, selectedBrandId, selectedModelId, selectedTypeId]);

  const selectedProduct =
    filteredProducts.find((product) => product.id === selectedProductId) || null;
  const settings = catalog?.settings;

  const selectProduct = (product: PhoneCoverCatalogProduct) => {
    updateParams({
      product: product.id,
      type: product.cover_type_id || selectedTypeId || null,
    });
  };

  const continueToStudio = () => {
    if (!selectedProduct) return;
    const inferredModelId = selectedModelId || (
      selectedProduct.supported_model_ids.length === 1
        ? selectedProduct.supported_model_ids[0]
        : ''
    );
    const inferredModel = catalog?.models.find((model) => model.id === inferredModelId);
    const inferredBrandId = selectedBrandId || inferredModel?.brand_id || '';
    const next = new URLSearchParams({ product: selectedProduct.id });
    const coverTypeId = selectedProduct.cover_type_id || selectedTypeId;
    if (coverTypeId) next.set('type', coverTypeId);
    if (inferredBrandId) next.set('brand', inferredBrandId);
    if (inferredModelId) next.set('model', inferredModelId);
    navigate(`/customize-phone-cover/configure?${next.toString()}`);
  };

  return (
    <div className="min-h-dvh bg-background">
      <Navbar />
      <CartDrawer />

      <main id="main-content" className="pb-16 pt-20 sm:pt-24">
        <div className="container mx-auto max-w-7xl px-3 sm:px-4 lg:px-8">
          <Link
            to="/shop?category=phone-cover"
            className="inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Phone Covers
          </Link>

          <motion.header
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-6 py-7 lg:grid-cols-[1fr_auto] lg:items-end lg:py-10"
          >
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-accent">
                <Sparkles className="h-3.5 w-3.5" />
                {settings?.hero_badge || 'Phone Cover Studio'}
              </div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                {settings?.hero_title || 'Build a cover that fits your phone'}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                Pick a cover, confirm your device, and personalize eligible styles. We only show compatible options as you go.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 rounded-2xl border bg-card/60 p-2 text-center text-xs sm:min-w-[360px]">
              {['Choose cover', 'Select device', 'Add to cart'].map((label, index) => (
                <div key={label} className="rounded-xl px-2 py-3">
                  <span className="mx-auto mb-1 grid h-6 w-6 place-items-center rounded-full bg-accent/10 font-bold text-accent">{index + 1}</span>
                  <span className="text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </motion.header>

          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-80 animate-pulse rounded-3xl bg-muted" />
              ))}
            </div>
          ) : isError ? (
            <div className="rounded-3xl border border-destructive/30 bg-destructive/10 p-8 text-center">
              <p className="mb-4 text-muted-foreground">We could not load the phone-cover catalog.</p>
              <Button variant="outline" onClick={() => refetch()}>Try again</Button>
            </div>
          ) : settings?.is_enabled === false ? (
            <div className="rounded-3xl border bg-card p-12 text-center">
              <Smartphone className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
              <h2 className="text-xl font-semibold">Phone-cover customisation is temporarily unavailable</h2>
            </div>
          ) : (
            <section className="rounded-[2rem] border bg-card/40 p-4 shadow-sm sm:p-6 lg:p-8" aria-labelledby="phone-cover-catalog-title">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Step 1</p>
                  <h2 id="phone-cover-catalog-title" className="mt-1 text-2xl font-bold sm:text-3xl">Choose a cover</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Use the filters to find a compatible style.</p>
                </div>
                <span className="text-sm text-muted-foreground">
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'option' : 'options'}
                </span>
              </div>

              <div className="mt-6 rounded-2xl border bg-background/70 p-3 sm:p-4">
                <div className="grid gap-3 lg:grid-cols-[1.3fr_0.85fr_0.85fr]">
                  <label className="relative">
                    <span className="sr-only">Search covers</span>
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={search}
                      onChange={(event) => updateParams({ search: event.target.value || null })}
                      placeholder="Search cover styles"
                      className="h-11 pl-9"
                    />
                  </label>
                  <label className="relative">
                    <span className="sr-only">Phone model</span>
                    <select
                      value={selectedModelId}
                      onChange={(event) => updateParams({ model: event.target.value || null, product: null })}
                      className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="">All phone models</option>
                      {availableModels.map((model) => <option key={model.id} value={model.id}>{model.name}</option>)}
                    </select>
                  </label>
                  <label className="relative">
                    <span className="sr-only">Cover type</span>
                    <select
                      value={selectedTypeId}
                      onChange={(event) => updateParams({ type: event.target.value || null, product: null })}
                      className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="">All cover types</option>
                      {catalog?.coverTypes.map((type) => <option key={type.id} value={type.id}>{type.name}</option>)}
                    </select>
                  </label>
                </div>

                <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1">
                  <SlidersHorizontal className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <Button size="sm" variant={!selectedBrandId ? 'default' : 'outline'} onClick={() => updateParams({ brand: null, model: null, product: null })}>All brands</Button>
                  {catalog?.brands.map((brand) => (
                    <Button
                      key={brand.id}
                      size="sm"
                      className="shrink-0"
                      variant={selectedBrandId === brand.id ? 'default' : 'outline'}
                      onClick={() => updateParams({ brand: brand.id, model: null, product: null })}
                    >
                      {brand.name}
                    </Button>
                  ))}
                </div>
              </div>

              {filteredProducts.length ? (
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredProducts.map((product) => {
                    const active = selectedProduct?.id === product.id;
                    const image = product.preview_image_url || product.images[0] || productPhoneFallback;
                    return (
                      <button
                        type="button"
                        key={product.id}
                        onClick={() => selectProduct(product)}
                        className={`group overflow-hidden rounded-2xl border bg-background text-left transition duration-200 hover:-translate-y-0.5 hover:border-accent/70 hover:shadow-lg ${active ? 'border-accent ring-2 ring-accent/15' : 'border-border'}`}
                      >
                        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                          <img
                            src={image}
                            alt={product.name}
                            onError={(event) => {
                              event.currentTarget.onerror = null;
                              event.currentTarget.src = productPhoneFallback;
                            }}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                          />
                          <div className="absolute inset-x-3 top-3 flex items-center justify-between gap-2">
                            <span className="rounded-full bg-background/90 px-2.5 py-1 text-[11px] font-semibold backdrop-blur">
                              {product.cover_type_name || 'Phone cover'}
                            </span>
                            {active ? (
                              <span className="grid h-8 w-8 place-items-center rounded-full bg-accent text-accent-foreground shadow">
                                <Check className="h-4 w-4" />
                              </span>
                            ) : product.is_featured ? (
                              <span className="rounded-full bg-accent px-2.5 py-1 text-[11px] font-semibold text-accent-foreground">Featured</span>
                            ) : null}
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="line-clamp-1 font-semibold">{product.name}</h3>
                          <p className="mt-1 line-clamp-2 min-h-10 text-sm leading-5 text-muted-foreground">
                            {product.description || 'Protective phone cover ready for your selected device.'}
                          </p>
                          <div className="mt-4 flex items-center justify-between gap-3">
                            <span className="text-xl font-bold">₹{product.price.toFixed(2)}</span>
                            <span className={`text-xs font-semibold ${active ? 'text-accent' : 'text-muted-foreground'}`}>
                              {active ? 'Selected' : 'Select cover'}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-6 rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
                  No covers match these filters. Try another brand or model.
                </div>
              )}

              {selectedProduct && (
                <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-accent/25 bg-accent/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <img
                      src={selectedProduct.preview_image_url || selectedProduct.images[0] || productPhoneFallback}
                      alt=""
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = productPhoneFallback;
                      }}
                      className="h-14 w-14 shrink-0 rounded-xl object-cover"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wider text-accent">Selected cover</p>
                      <p className="truncate font-semibold">{selectedProduct.name}</p>
                    </div>
                  </div>
                  <Button onClick={continueToStudio} className="min-h-11 sm:min-w-52">
                    Choose device
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </section>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CustomizePhoneCover;
