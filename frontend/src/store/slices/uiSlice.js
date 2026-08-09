import { createSlice } from "@reduxjs/toolkit";

let toastTimer = null;

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    cartOpen: false,
    toast: null,
  },
  reducers: {
    openCart(state) {
      state.cartOpen = true;
    },
    closeCart(state) {
      state.cartOpen = false;
    },
    toggleCart(state) {
      state.cartOpen = !state.cartOpen;
    },
    setToast(state, action) {
      state.toast = action.payload;
    },
    clearToast(state) {
      state.toast = null;
    },
  },
});

export const { openCart, closeCart, toggleCart, setToast, clearToast } = uiSlice.actions;

export const showToast = (message, tone = "default") => (dispatch) => {
  if (toastTimer) clearTimeout(toastTimer);
  dispatch(setToast({ message, tone, id: Date.now() }));
  toastTimer = setTimeout(() => {
    dispatch(clearToast());
    toastTimer = null;
  }, 2800);
};

export default uiSlice.reducer;
