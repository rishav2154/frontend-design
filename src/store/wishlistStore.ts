import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

interface WishlistStore {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  toggleItem: (item: WishlistItem) => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        set((state) => ({
          items: [...state.items, item],
        }));
      },
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },
      isInWishlist: (id) => {
        return get().items.some((item) => item.id === id);
      },
      toggleItem: (item) => {
        const isInWishlist = get().isInWishlist(item.id);
        if (isInWishlist) {
          get().removeItem(item.id);
        } else {
          get().addItem(item);
        }
      },
    }),
    {
      name: 'giftoria-wishlist',
    }
  )
);
