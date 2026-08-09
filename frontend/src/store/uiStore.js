import { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  openCart as openCartAction,
  closeCart as closeCartAction,
  toggleCart as toggleCartAction,
  showToast as showToastThunk,
} from "./slices/uiSlice";

/** Redux-backed UI hook (same selector API as the old Zustand store). */
export function useUiStore(selector) {
  const dispatch = useDispatch();
  const cartOpen = useSelector((s) => s.ui.cartOpen);
  const toast = useSelector((s) => s.ui.toast);

  const openCart = useCallback(() => {
    dispatch(openCartAction());
  }, [dispatch]);

  const closeCart = useCallback(() => {
    dispatch(closeCartAction());
  }, [dispatch]);

  const toggleCart = useCallback(() => {
    dispatch(toggleCartAction());
  }, [dispatch]);

  const showToast = useCallback(
    (message, tone = "default") => {
      dispatch(showToastThunk(message, tone));
    },
    [dispatch]
  );

  const api = useMemo(
    () => ({
      cartOpen,
      toast,
      openCart,
      closeCart,
      toggleCart,
      showToast,
    }),
    [cartOpen, toast, openCart, closeCart, toggleCart, showToast]
  );

  return selector ? selector(api) : api;
}
