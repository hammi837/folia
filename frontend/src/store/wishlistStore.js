import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (productId) => {
        const exists = get().ids.includes(productId);
        set({
          ids: exists ? get().ids.filter((id) => id !== productId) : [...get().ids, productId],
        });
      },
      has: (productId) => get().ids.includes(productId),
      clear: () => set({ ids: [] }),
    }),
    { name: "folia-wishlist" }
  )
);
