import { create } from "zustand";

export const useUiStore = create((set) => ({
  cartOpen: false,
  toast: null,
  openCart: () => set({ cartOpen: true }),
  closeCart: () => set({ cartOpen: false }),
  toggleCart: () => set((s) => ({ cartOpen: !s.cartOpen })),
  showToast: (message, tone = "default") => {
    set({ toast: { message, tone, id: Date.now() } });
    setTimeout(() => set({ toast: null }), 2800);
  },
}));
