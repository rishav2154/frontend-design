import { ArrowUpRight, PackageOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/product-skeleton';
import { CatalogOfferBanner } from '@/components/home/CatalogOfferBanner';
import type { Product } from '@/hooks/useProducts';
import { categories, getCategoryLabel } from '@/hooks/useProducts';

interface GiftCollectionsProps {
  products: Product[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

export const GiftCollections = ({ products, isLoading, isError, onRetry }: GiftCollectionsProps) => {
  const knownOrder = categories
    .filter((category) => category.id !== 'phone-cover')
    .map((category) => category.id);
  const presentCategories = Array.from(new Set(products.map((product) => product.category)));
  const orderedCategories = [
    ...knownOrder.filter((category) => presentCategories.includes(category)),
    ...presentCategories.filter((category) => !knownOrder.includes(category)),
  ];

  return (
    <section className="home-section home-gift-catalog" aria-labelledby="gift-catalog-heading">
      <div className="home-shell px-4 sm:px-6 lg:px-8">
        <div className="mb-10 grid gap-5 md:grid-cols-[1fr_0.52fr] md:items-end sm:mb-14">
          <div>
            <p className="home-eyebrow">Beyond the phone case</p>
            <h2 id="gift-catalog-heading" className="font-editorial home-section-heading mt-3 max-w-3xl text-4xl leading-[0.96] tracking-[-0.04em] sm:text-6xl">
              Gifts and everyday pieces, ready for your touch.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-7 text-foreground/[0.64] sm:text-base">
            Every currently listed non-phone product appears below, grouped so customers can find the right kind of gift quickly.
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-12" role="status" aria-live="polite" aria-label="Loading gift collections">
            {[0, 1].map((group) => (
              <div key={group}>
                <div className="liquid-glass mb-5 h-16 animate-pulse rounded-2xl" />
                <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
                  {[0, 1, 2, 3].map((item) => <ProductCardSkeleton key={item} />)}
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="home-state-panel liquid-glass grid min-h-72 place-items-center px-6 text-center" role="alert">
            <div className="max-w-md">
              <PackageOpen className="mx-auto h-8 w-8 text-accent" aria-hidden="true" />
              <h3 className="font-editorial mt-4 text-3xl">The gift collections could not load.</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Try again to see the products currently listed in the shop.</p>
              <button type="button" onClick={onRetry} className="home-button home-button-primary mt-6">Try again</button>
            </div>
          </div>
        ) : orderedCategories.length > 0 ? (
          <div className="space-y-14 sm:space-y-20">
            {orderedCategories.map((categoryId) => {
              const items = products.filter((product) => product.category === categoryId);
              const label = getCategoryLabel(categoryId);

              return (
                <section key={categoryId} aria-labelledby={`collection-${categoryId}`}>
                  <div className="home-collection-header liquid-glass relative mb-5 p-5 sm:mb-7 sm:p-7">
                    <div className="relative z-10 flex items-end justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent sm:text-xs">
                          {items.length} {items.length === 1 ? 'piece' : 'pieces'} currently listed
                        </p>
                        <h3 id={`collection-${categoryId}`} className="font-editorial mt-1.5 text-3xl leading-none tracking-[-0.03em] sm:text-4xl">
                          {label}
                        </h3>
                      </div>
                      <Link to={`/shop?category=${encodeURIComponent(categoryId)}`} className="home-text-link group shrink-0">
                        <span className="hidden min-[400px]:inline">Shop </span>{label}
                        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
                    {items.map((product, index) => (
                      <ProductCard key={product.id} product={product} index={index} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <div className="home-state-panel liquid-glass px-6 py-14 text-center">
            <h3 className="font-editorial text-3xl">No other collections are listed right now.</h3>
            <p className="mt-2 text-sm text-muted-foreground">The phone-case studio is still open whenever inspiration strikes.</p>
          </div>
        )}

        <div className="mt-14 sm:mt-20">
          <CatalogOfferBanner />
        </div>
      </div>
    </section>
  );
};
