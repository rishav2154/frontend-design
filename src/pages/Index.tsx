import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { HeroSection } from '@/components/home/HeroSection';
import { ShopByCategory } from '@/components/home/ShopByCategory';
import { MarqueeBanner } from '@/components/home/MarqueeBanner';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { GiftCollections } from '@/components/home/GiftCollections';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { CTASection } from '@/components/home/CTASection';
import { WhatsAppHelpFab } from '@/components/home/WhatsAppHelpFab';
import { useProducts } from '@/hooks/useProducts';

const isPhoneProduct = (product: { id: string; name: string; category: string }) => {
  const searchableName = product.name.toLocaleLowerCase();
  return (
    product.category === 'phone-cover' ||
    product.id === 'customize-phone-cover' ||
    (product.category === 'custom' && searchableName.includes('phone cover'))
  );
};

const Index = () => {
  const { data: products = [], isLoading, isError, refetch } = useProducts();
  const phoneProducts = products.filter(isPhoneProduct);
  const giftProducts = products.filter((product) => !isPhoneProduct(product));

  return (
    <div className="home-editorial min-h-dvh bg-background">
      <div className="home-atmosphere" aria-hidden="true" />
      <Navbar />
      <CartDrawer />
      <main id="main-content" tabIndex={-1}>
        <HeroSection />
        <MarqueeBanner />
        <ShopByCategory />
        <FeaturedProducts
          products={phoneProducts}
          isLoading={isLoading}
          isError={isError}
          onRetry={() => void refetch()}
        />
        <FeaturesSection />
        <GiftCollections
          products={giftProducts}
          isLoading={isLoading}
          isError={isError}
          onRetry={() => void refetch()}
        />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
      <WhatsAppHelpFab />
    </div>
  );
};

export default Index;
