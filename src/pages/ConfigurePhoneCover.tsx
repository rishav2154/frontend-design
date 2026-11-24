import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Smartphone } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { PhoneCoverCustomizer } from '@/components/phone-cover-editor/PhoneCoverCustomizer';
import { Button } from '@/components/ui/button';
import { usePhoneCoverCatalog } from '@/hooks/usePhoneCoverCatalog';
import productPhoneFallback from '@/assets/product-phone.jpg';

const ConfigurePhoneCover = () => {
  const [searchParams] = useSearchParams();
  const { data: catalog, isLoading, isError, refetch } = usePhoneCoverCatalog();

  const productId = searchParams.get('product') || '';
  const selectedBrandId = searchParams.get('brand') || '';
  const selectedModelId = searchParams.get('model') || '';
  const selectedTypeId = searchParams.get('type') || '';
  const product = catalog?.products.find((entry) => entry.id === productId) || null;
  const effectiveModelId = selectedModelId || (
    product?.supported_model_ids.length === 1
      ? product.supported_model_ids[0]
      : ''
  );
  const selectedModel = catalog?.models.find((model) => model.id === effectiveModelId);
  const initialBrandId = selectedBrandId || selectedModel?.brand_id || '';

  const backParams = new URLSearchParams();
  if (productId) backParams.set('product', productId);
  if (selectedTypeId) backParams.set('type', selectedTypeId);
  if (selectedBrandId) backParams.set('brand', selectedBrandId);
  if (effectiveModelId) backParams.set('model', effectiveModelId);
  const backHref = `/customize-phone-cover${backParams.size ? `?${backParams.toString()}` : ''}`;

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  return (
    <div className="min-h-dvh bg-background">
      <Navbar />
      <CartDrawer />

      <main id="main-content" className="pb-16 pt-20 sm:pt-24">
        <div className="container mx-auto max-w-7xl px-3 sm:px-4 lg:px-8">
          <Link
            to={backHref}
            className="inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Change selected cover
          </Link>

          {isLoading ? (
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="h-[460px] animate-pulse rounded-3xl bg-muted" />
              <div className="space-y-4">
                <div className="h-44 animate-pulse rounded-2xl bg-muted" />
                <div className="h-44 animate-pulse rounded-2xl bg-muted" />
              </div>
            </div>
          ) : isError ? (
            <div className="mt-8 rounded-3xl border border-destructive/30 bg-destructive/10 p-10 text-center">
              <p className="mb-4 text-muted-foreground">We could not load the selected phone cover.</p>
              <Button variant="outline" onClick={() => refetch()}>Try again</Button>
            </div>
          ) : !product ? (
            <div className="mt-8 rounded-3xl border bg-card p-10 text-center">
              <Smartphone className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
              <h1 className="text-xl font-semibold">Select a phone cover first</h1>
              <p className="mt-2 text-sm text-muted-foreground">Choose a cover before configuring your phone model.</p>
              <Button asChild className="mt-5">
                <Link to="/customize-phone-cover">Browse phone covers</Link>
              </Button>
            </div>
          ) : catalog?.settings.is_enabled === false ? (
            <div className="mt-8 rounded-3xl border bg-card p-10 text-center">
              <h1 className="text-xl font-semibold">Phone-cover customisation is temporarily unavailable</h1>
            </div>
          ) : (
            <>
              <motion.header
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid gap-5 py-6 lg:grid-cols-[1fr_auto] lg:items-end lg:py-9"
              >
                <div className="max-w-3xl">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Step 2 · Configure</p>
                  <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Confirm your device</h1>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">
                    Your selected cover is ready. Choose the exact phone model and finish any available personalization.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 rounded-2xl border bg-card/60 p-2 text-center text-xs sm:min-w-[360px]">
                  <div className="rounded-xl px-2 py-3 text-accent">
                    <span className="mx-auto mb-1 grid h-6 w-6 place-items-center rounded-full bg-accent text-accent-foreground"><Check className="h-3.5 w-3.5" /></span>
                    Cover chosen
                  </div>
                  <div className="rounded-xl bg-accent/10 px-2 py-3 font-semibold text-accent">
                    <span className="mx-auto mb-1 grid h-6 w-6 place-items-center rounded-full bg-accent text-accent-foreground">2</span>
                    Select device
                  </div>
                  <div className="rounded-xl px-2 py-3 text-muted-foreground">
                    <span className="mx-auto mb-1 grid h-6 w-6 place-items-center rounded-full bg-muted">3</span>
                    Add to cart
                  </div>
                </div>
              </motion.header>

              <div className="mb-7 flex items-center gap-3 rounded-2xl border border-accent/25 bg-accent/5 p-4">
                <img
                  src={product.preview_image_url || product.images[0] || productPhoneFallback}
                  alt=""
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = productPhoneFallback;
                  }}
                  className="h-16 w-16 shrink-0 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-accent">Selected cover</p>
                  <p className="truncate font-semibold">{product.name}</p>
                  <p className="text-sm text-muted-foreground">{product.cover_type_name || 'Phone cover'} · ₹{product.price.toFixed(2)}</p>
                </div>
                <Button asChild variant="outline" className="hidden sm:inline-flex">
                  <Link to={backHref}>Change</Link>
                </Button>
              </div>

              <PhoneCoverCustomizer
                product={product}
                initialBrandId={initialBrandId}
                initialModelId={effectiveModelId}
                settings={catalog?.settings}
              />
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ConfigurePhoneCover;
