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
    model?: string;
    coverType?: string;
    specialInstructions?: string;
  };
}

export interface AppliedCoupon {
  discount: any;
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
  removeCoupon: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      appliedCoupon: null,

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

      clearCart: () => set({ items: [], appliedCoupon: null }),

      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      getTotalItems: () =>
        get().items.reduce((t, i) => t + i.quantity, 0),

      getTotalPrice: () =>
        get().items.reduce((t, i) => t + i.price * i.quantity, 0),

      applyCoupon: (coupon) => set({ appliedCoupon: coupon }),
      removeCoupon: () => set({ appliedCoupon: null }),

      getDiscount: () => {
        const { appliedCoupon, getTotalPrice } = get();
        if (!appliedCoupon) return 0;

        const subtotal = getTotalPrice();

        if (appliedCoupon.discountType === "percentage") {
          const d = (subtotal * appliedCoupon.discountValue) / 100;
          return appliedCoupon.maxDiscount
            ? Math.min(d, appliedCoupon.maxDiscount)
            : d;
        }

        if (appliedCoupon.discountType === "fixed") {
          return Math.min(appliedCoupon.discountValue, subtotal);
        }

        return 0;
      },

      getFinalPrice: () => {
        const { getTotalPrice, getDiscount } = get();
        return getTotalPrice() - getDiscount();
      },
    }),
    { name: "giftoria-cart" }
  )
);
