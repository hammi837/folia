import { createSlice } from "@reduxjs/toolkit";

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: {
    ids: [],
  },
  reducers: {
    toggleWishlist(state, action) {
      const productId = action.payload;
      if (state.ids.includes(productId)) {
        state.ids = state.ids.filter((id) => id !== productId);
      } else {
        state.ids.push(productId);
      }
    },
    clearWishlist(state) {
      state.ids = [];
    },
  },
});

export const { toggleWishlist, clearWishlist } = wishlistSlice.actions;
export const selectWishlistIds = (state) => state.wishlist.ids;
export const selectHasWishlist = (id) => (state) => state.wishlist.ids.includes(id);

export default wishlistSlice.reducer;
