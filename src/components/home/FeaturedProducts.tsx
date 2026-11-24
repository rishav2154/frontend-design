import { AlertCircle, ArrowUpRight, Loader2, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProductCard } from '@/components/products/ProductCard';
import type { Product } from '@/hooks/useProducts';

interface FeaturedProductsProps {
  products: Product[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

export const FeaturedProducts = ({ products, isLoading, isError, onRetry }: FeaturedProductsProps) => {
  return (
    <section className="home-section home-case-edit" aria-labelledby="case-edit-heading">
      <div className="home-shell px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-5 sm:mb-12">
          <div>
            <p className="home-eyebrow">Professional phone cases</p>
            <h2 id="case-edit-heading" className="font-editorial home-section-heading mt-3 text-4xl leading-[0.94] tracking-[-0.04em] sm:text-6xl">
              Every listed case.<br className="hidden sm:block" /> Ready to make personal.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-foreground/[0.64] sm:text-base">
              Browse every phone-case product currently available, then choose your exact phone and finish in the studio.
            </p>
          </div>
          <Link to="/shop?category=phone-cover" className="home-text-link group hidden sm:inline-flex">
            Shop phone cases
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>

        {isLoading ? (
          <div className="home-state-panel liquid-glass grid min-h-72 place-items-center" role="status" aria-live="polite">
            <div className="text-center">
              <Loader2 className="mx-auto h-7 w-7 animate-spin text-accent" aria-hidden="true" />
              <p className="mt-3 text-sm text-muted-foreground">Loading every phone case…</p>
            </div>
          </div>
        ) : isError ? (
          <div className="home-state-panel liquid-glass grid min-h-72 place-items-center px-6 text-center" role="alert">
            <div>
              <AlertCircle className="mx-auto h-7 w-7 text-accent" aria-hidden="true" />
              <h3 className="font-editorial mt-4 text-3xl">The phone cases could not load.</h3>
              <p className="mt-2 text-sm text-muted-foreground">The case studio is still ready whenever you are.</p>
              <button type="button" onClick={onRetry} className="home-button home-button-primary mt-5">
                Try again
              </button>
            </div>
          </div>
        ) : products.length > 0 ? (
          <div className={`grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4 ${products.length === 1 ? 'lg:grid-cols-[minmax(250px,340px)_minmax(0,1fr)]' : ''}`}>
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
            {products.length === 1 && (
              <div className="home-editorial-panel liquid-glass-luminous hidden min-h-full flex-col justify-end lg:flex">
                <span className="home-icon-orb">
                  <Smartphone className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
                </span>
                <p className="home-eyebrow mt-auto pt-14">One product, many possibilities</p>
                <h3 className="font-editorial home-section-heading mt-3 max-w-xl text-4xl leading-[0.98] tracking-[-0.035em]">
                  Your phone model and chosen finish shape the final case.
                </h3>
                <p className="mt-4 max-w-xl text-sm leading-7 text-foreground/[0.62]">
                  Open the studio to see the choices available for your phone before adding anything to the cart.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="home-empty-edit home-state-panel liquid-glass-luminous grid min-h-[340px] place-items-center overflow-hidden px-6 text-center">
            <div className="max-w-md">
              <p className="home-eyebrow">Made from your photo</p>
              <h3 className="font-editorial mt-3 text-4xl leading-none tracking-[-0.03em]">Your custom case starts in the studio.</h3>
              <p className="mt-4 text-sm leading-6 text-foreground/[0.64]">
                Choose the phone you own and build a one-off design rather than settling for something off the shelf.
              </p>
              <Link to="/customize-phone-cover" className="home-button home-button-primary mt-6">
                Design my case
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        )}

        <Link to="/shop?category=phone-cover" className="home-text-link group mt-7 justify-center sm:hidden">
          Shop phone cases
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
};
