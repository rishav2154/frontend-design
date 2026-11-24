import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCartStore } from '@/store/cartStore';
import { CouponInput } from '@/components/cart/CouponInput';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

export const CartDrawer = () => {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    getTotalPrice,
    getDiscount,
    appliedCoupon,
    appliedCoupons,
  } = useCartStore();

  const safePrice = (price: unknown) => Number(price) || 0;
  const subtotal = safePrice(getTotalPrice());
  const discount = safePrice(getDiscount());
  const activeCoupons = appliedCoupons.length
    ? appliedCoupons
    : appliedCoupon
      ? [appliedCoupon]
      : [];

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent
        side="right"
        className="storefront-glass-drawer flex w-full max-w-md flex-col gap-0 border-l p-0 [&>button]:hidden"
      >
        <SheetHeader className="flex-row items-center justify-between space-y-0 border-b border-border p-4 pr-4 text-left sm:p-6">
          <div className="flex min-w-0 items-center gap-3">
            <ShoppingBag className="h-6 w-6 shrink-0 text-accent" aria-hidden="true" />
            <SheetTitle className="truncate text-xl">Your Cart</SheetTitle>
            <span className="shrink-0 rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
              {items.length} items
            </span>
          </div>
          <SheetClose asChild>
            <button
              type="button"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-muted/50 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Close cart"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </SheetClose>
          <SheetDescription className="sr-only">
            Review and update the products in your cart.
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6">
          {items.length === 0 ? (
            <div className="flex h-full min-h-72 flex-col items-center justify-center text-center">
              <ShoppingBag className="mb-4 h-10 w-10 text-muted-foreground" aria-hidden="true" />
              <h3 className="mb-2 text-lg font-medium">Your cart is empty</h3>
              <Link to="/shop" onClick={closeCart} className="btn-luxury text-sm">
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const price = safePrice(item.price);

                return (
                  <div key={item.id} className="glass-card flex min-w-0 gap-3 p-3 sm:gap-4 sm:p-4">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted sm:h-20 sm:w-20">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="line-clamp-2 text-sm font-medium">{item.name}</h4>
                          <p className="mt-1 text-sm font-semibold">₹{price.toFixed(2)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-10 sm:w-10"
                          aria-label={`Remove ${item.name} from cart`}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>

                      <div className="mt-2 flex items-center gap-1.5" aria-label={`Quantity for ${item.name}`}>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="flex h-11 w-11 items-center justify-center rounded-lg bg-muted transition-colors hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-9 sm:w-9"
                          aria-label={`Decrease quantity of ${item.name}`}
                        >
                          <Minus className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <span className="w-8 text-center font-medium" aria-live="polite">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="flex h-11 w-11 items-center justify-center rounded-lg bg-muted transition-colors hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-9 sm:w-9"
                          aria-label={`Increase quantity of ${item.name}`}
                        >
                          <Plus className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:p-6 sm:pb-6">
            <div className="mb-5">
              <p className="mb-2 text-sm font-medium">Have a coupon?</p>
              <CouponInput />
            </div>

            <div className="mb-4 space-y-2 border-t border-border pt-4">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              {activeCoupons.length > 0 && (
                <div className="flex justify-between text-sm text-green-500">
                  <span className="min-w-0 truncate">Discount ({activeCoupons.map((coupon) => coupon.code).join(', ')})</span>
                  <span>-₹{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold">
                <span>{activeCoupons.length ? 'After discount' : 'Subtotal'}</span>
                <span>₹{Math.max(0, subtotal - discount).toFixed(2)}</span>
              </div>
            </div>

            <Link
              to="/checkout"
              onClick={closeCart}
              className="btn-luxury block min-h-12 w-full text-center"
            >
              Checkout
            </Link>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
