import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity = 1, variant = null) => {
        const key = `${product.id}-${variant?.id || "default"}`;
        const existing = get().items.find((i) => i.key === key);
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.key === key ? { ...i, quantity: i.quantity + quantity } : i
            ),
          });
          return;
        }
        set({
          items: [
            ...get().items,
            {
              key,
              productId: product.id,
              slug: product.slug,
              name: product.name,
              price: Number(variant?.price_override ?? product.price),
              image: product.images?.[0]?.url || product.image_url || null,
              variantId: variant?.id || null,
              variantName: variant?.name || null,
              quantity,
            },
          ],
        });
      },
      setQuantity: (key, quantity) => {
        if (quantity <= 0) {
          set({ items: get().items.filter((i) => i.key !== key) });
          return;
        }
        set({
          items: get().items.map((i) => (i.key === key ? { ...i, quantity } : i)),
        });
      },
      removeItem: (key) => set({ items: get().items.filter((i) => i.key !== key) }),
      clear: () => set({ items: [] }),
      subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: "folia-cart" }
  )
);
