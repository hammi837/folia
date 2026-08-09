import { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addItem as addItemAction,
  setQuantity as setQuantityAction,
  removeItem as removeItemAction,
  clearCart,
  selectCartSubtotal,
} from "./slices/cartSlice";

/** Redux-backed cart hook (same selector API as the old Zustand store). */
export function useCartStore(selector) {
  const dispatch = useDispatch();
  const items = useSelector((s) => s.cart?.items ?? []);
  const subtotalValue = useSelector((s) =>
    (s.cart?.items ?? []).reduce((sum, i) => sum + Number(i.price || 0) * Number(i.quantity || 0), 0)
  );

  const addItem = useCallback(
    (product, quantity = 1, variant = null) => {
      dispatch(addItemAction({ product, quantity, variant }));
    },
    [dispatch]
  );

  const setQuantity = useCallback(
    (key, quantity) => {
      dispatch(setQuantityAction({ key, quantity }));
    },
    [dispatch]
  );

  const removeItem = useCallback(
    (key) => {
      dispatch(removeItemAction(key));
    },
    [dispatch]
  );

  const clear = useCallback(() => {
    dispatch(clearCart());
  }, [dispatch]);

  const subtotal = useCallback(() => subtotalValue, [subtotalValue]);

  const api = useMemo(
    () => ({
      items: Array.isArray(items) ? items : [],
      addItem,
      setQuantity,
      removeItem,
      clear,
      subtotal,
    }),
    [items, addItem, setQuantity, removeItem, clear, subtotal]
  );

  return selector ? selector(api) : api;
}
