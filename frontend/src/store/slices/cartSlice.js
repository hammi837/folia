import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
  },
  reducers: {
    addItem(state, action) {
      const { product, quantity = 1, variant = null } = action.payload;
      const key = `${product.id}-${variant?.id || "default"}`;
      const existing = state.items.find((i) => i.key === key);
      if (existing) {
        existing.quantity += quantity;
        return;
      }
      state.items.push({
        key,
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: Number(variant?.price_override ?? product.price),
        image: product.images?.[0]?.url || product.image_url || null,
        variantId: variant?.id || null,
        variantName: variant?.name || null,
        quantity,
      });
    },
    setQuantity(state, action) {
      const { key, quantity } = action.payload;
      if (quantity <= 0) {
        state.items = state.items.filter((i) => i.key !== key);
        return;
      }
      const item = state.items.find((i) => i.key === key);
      if (item) item.quantity = quantity;
    },
    removeItem(state, action) {
      state.items = state.items.filter((i) => i.key !== action.payload);
    },
    clearCart(state) {
      state.items = [];
    },
  },
});

export const { addItem, setQuantity, removeItem, clearCart } = cartSlice.actions;

export const selectCartItems = (state) => state.cart?.items ?? [];
export const selectCartSubtotal = (state) =>
  (state.cart?.items ?? []).reduce((sum, i) => sum + Number(i.price || 0) * Number(i.quantity || 0), 0);
export const selectCartCount = (state) =>
  (state.cart?.items ?? []).reduce((n, i) => n + Number(i.quantity || 0), 0);

export default cartSlice.reducer;
