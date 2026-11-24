const MOBILE_NAV_ROUTES = new Set([
  '/',
  '/shop',
  '/customize',
  '/cart',
  '/account',
  '/orders',
  '/about',
  '/wishlist',
  '/returns',
]);

export const shouldShowMobileBottomNav = (pathname: string) =>
  MOBILE_NAV_ROUTES.has(pathname) ||
  (pathname.startsWith('/product/') && pathname !== '/product/customize-phone-cover');
