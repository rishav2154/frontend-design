import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  customization?: {
    text?: string;
    imageUrl?: string;
    color?: string;
    variant?: string;
    designUrl?: string;
    brand?: string;
    brandId?: string;
    model?: string;
    modelId?: string;
    coverType?: string;
    coverTypeId?: string;
    specialInstructions?: string;
  };
}

export interface AppliedCoupon {
  code: string;
  discountType: "percentage" | "fixed" | "free_shipping";
  discountValue: number;
  maxDiscount?: number;
  description?: string;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  appliedCoupon: AppliedCoupon | null;
  appliedCoupons: AppliedCoupon[];

  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;

  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;

  getTotalItems: () => number;
  getTotalPrice: () => number;
  getDiscount: () => number;
  getFinalPrice: () => number;

  applyCoupon: (coupon: AppliedCoupon) => void;
  removeCoupon: (code?: string) => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      appliedCoupon: null,
      appliedCoupons: [],

      addItem: (item) => {
        if (!item.productId || !item.name || !item.price) return;

        const id = `${item.productId}-${Date.now()}`;

        set((state) => ({
          items: [...state.items, { ...item, id }],
        }));
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        }));
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }

        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, quantity } : i
          ),
        }));
      },

      clearCart: () => set({ items: [], appliedCoupon: null, appliedCoupons: [] }),

      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      getTotalItems: () =>
        get().items.reduce((t, i) => t + i.quantity, 0),

      getTotalPrice: () =>
        get().items.reduce((t, i) => t + i.price * i.quantity, 0),

      applyCoupon: (coupon) => set((state) => {
        const current = state.appliedCoupons.length
          ? state.appliedCoupons
          : state.appliedCoupon
            ? [state.appliedCoupon]
            : [];
        const withoutDuplicate = current.filter(
          (entry) => entry.code.toLocaleUpperCase() !== coupon.code.toLocaleUpperCase(),
        );
        const appliedCoupons = [...withoutDuplicate, coupon].slice(0, 5);
        return { appliedCoupons, appliedCoupon: appliedCoupons[0] || null };
      }),
      removeCoupon: (code) => set((state) => {
        if (!code) return { appliedCoupon: null, appliedCoupons: [] };
        const current = state.appliedCoupons.length
          ? state.appliedCoupons
          : state.appliedCoupon
            ? [state.appliedCoupon]
            : [];
        const appliedCoupons = current.filter(
          (entry) => entry.code.toLocaleUpperCase() !== code.toLocaleUpperCase(),
        );
        return { appliedCoupons, appliedCoupon: appliedCoupons[0] || null };
      }),

      getDiscount: () => {
        const { appliedCoupon, appliedCoupons, getTotalPrice } = get();
        const coupons = appliedCoupons.length
          ? appliedCoupons
          : appliedCoupon
            ? [appliedCoupon]
            : [];
        const subtotal = getTotalPrice();
        const discount = coupons.reduce((total, coupon) => {
          if (coupon.discountType === "percentage") {
            const amount = (subtotal * coupon.discountValue) / 100;
            return total + (coupon.maxDiscount ? Math.min(amount, coupon.maxDiscount) : amount);
          }
          if (coupon.discountType === "fixed") {
            return total + coupon.discountValue;
          }
          return total;
        }, 0);
        return Math.min(discount, subtotal);
      },

      getFinalPrice: () => {
        const { getTotalPrice, getDiscount } = get();
        return getTotalPrice() - getDiscount();
      },
    }),
    {
      name: "design-hive-cart",
      version: 2,
      migrate: (persistedState: any) => ({
        ...persistedState,
        appliedCoupons: Array.isArray(persistedState?.appliedCoupons)
          ? persistedState.appliedCoupons
          : persistedState?.appliedCoupon
            ? [persistedState.appliedCoupon]
            : [],
      }),
    }
  )
);
