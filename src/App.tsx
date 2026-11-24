import { lazy, Suspense, type ReactNode, useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, MotionConfig } from "framer-motion";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { PageTransition } from "@/components/layout/PageTransition";
import Index from "./pages/Index";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import MetaPixelTracker from "@/components/meta/MetaPixelTracker";

const Shop = lazy(() => import("./pages/Shop"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Customize = lazy(() => import("./pages/Customize"));
const CustomizePhoneCover = lazy(() => import("./pages/CustomizePhoneCover"));
const ConfigurePhoneCover = lazy(() => import("./pages/ConfigurePhoneCover"));
const Cart = lazy(() => import("./pages/Cart"));
const Auth = lazy(() => import("./pages/Auth"));
const Account = lazy(() => import("./pages/Account"));
const Checkout = lazy(() => import("./pages/Checkout"));
const OrderSuccess = lazy(() => import("./pages/OrderSuccess"));
const OrdersHistory = lazy(() => import("./pages/OrdersHistory"));
const About = lazy(() => import("./pages/About"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const ReturnPolicy = lazy(() => import("./pages/ReturnPolicy"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminCoupons = lazy(() => import("./pages/admin/AdminCoupons"));
const AdminBanners = lazy(() => import("./pages/admin/AdminBanners"));
const AdminPhoneCovers = lazy(() => import("./pages/admin/AdminPhoneCovers"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminResetPassword = lazy(() => import("./pages/admin/AdminResetPassword"));
const AdBannerPopup = lazy(() =>
  import("@/components/banners/AdBannerPopup").then((module) => ({
    default: module.AdBannerPopup,
  })),
);

const queryClient = new QueryClient();

const RouteFallback = () => (
  <div className="grid min-h-[50dvh] place-items-center bg-background px-4" role="status" aria-label="Loading page">
    <div className="h-10 w-10 animate-pulse rounded-full border border-accent/40 bg-accent/15" />
  </div>
);

const withPageTransition = (page: ReactNode) => (
  <PageTransition>
    <Suspense fallback={<RouteFallback />}>{page}</Suspense>
  </PageTransition>
);

const withoutPageTransition = (page: ReactNode) => (
  <Suspense fallback={<RouteFallback />}>{page}</Suspense>
);

const DeferredAdBannerPopup = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const windowWithIdleCallback = window as typeof window & {
      requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    if (windowWithIdleCallback.requestIdleCallback) {
      const idleHandle = windowWithIdleCallback.requestIdleCallback(
        () => setIsReady(true),
        { timeout: 1500 },
      );

      return () => windowWithIdleCallback.cancelIdleCallback?.(idleHandle);
    }

    const timeoutHandle = window.setTimeout(() => setIsReady(true), 500);
    return () => window.clearTimeout(timeoutHandle);
  }, []);

  if (!isReady) return null;

  return (
    <Suspense fallback={null}>
      <AdBannerPopup />
    </Suspense>
  );
};

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <>
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={withPageTransition(<Index />)} />
          <Route path="/shop" element={withPageTransition(<Shop />)} />
          <Route path="/product/:id" element={withPageTransition(<ProductDetail />)} />
          <Route path="/customize" element={withPageTransition(<Customize />)} />
          <Route path="/customize-phone-cover" element={withPageTransition(<CustomizePhoneCover />)} />
          <Route path="/customize-phone-cover/configure" element={withPageTransition(<ConfigurePhoneCover />)} />
          <Route path="/product/customize-phone-cover" element={<Navigate to="/customize-phone-cover" replace />} />
          <Route path="/cart" element={withPageTransition(<Cart />)} />
          <Route path="/auth" element={withPageTransition(<Auth />)} />
          <Route path="/account" element={withPageTransition(<Account />)} />
          <Route path="/checkout" element={withPageTransition(<Checkout />)} />
          <Route path="/order-success/:orderId" element={withPageTransition(<OrderSuccess />)} />
          <Route path="/orders" element={withPageTransition(<OrdersHistory />)} />
          <Route path="/about" element={withPageTransition(<About />)} />
          <Route path="/wishlist" element={withPageTransition(<Wishlist />)} />
          <Route path="/returns" element={withPageTransition(<ReturnPolicy />)} />
          <Route path="/admin/login" element={withPageTransition(<AdminLogin />)} />
          <Route path="/admin/reset-password" element={withPageTransition(<AdminResetPassword />)} />
          <Route path="/admin" element={withoutPageTransition(<AdminDashboard />)} />
          <Route path="/admin/products" element={withoutPageTransition(<AdminProducts />)} />
          <Route path="/admin/orders" element={withoutPageTransition(<AdminOrders />)} />
          <Route path="/admin/coupons" element={withoutPageTransition(<AdminCoupons />)} />
          <Route path="/admin/banners" element={withoutPageTransition(<AdminBanners />)} />
          <Route path="/admin/phone-covers" element={withoutPageTransition(<AdminPhoneCovers />)} />
          <Route path="/admin/users" element={withoutPageTransition(<AdminUsers />)} />
          <Route path="*" element={withPageTransition(<NotFound />)} />
        </Routes>
      </AnimatePresence>
      <MobileBottomNav />
    </>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <MotionConfig reducedMotion="user">
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <MetaPixelTracker />
              <AnimatedRoutes />
              <DeferredAdBannerPopup />
            </BrowserRouter>
          </MotionConfig>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
