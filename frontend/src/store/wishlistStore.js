import { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleWishlist, clearWishlist } from "./slices/wishlistSlice";

/** Redux-backed wishlist hook (same selector API as the old Zustand store). */
export function useWishlistStore(selector) {
  const dispatch = useDispatch();
  const ids = useSelector((s) => (Array.isArray(s.wishlist?.ids) ? s.wishlist.ids : []));

  const toggle = useCallback(
    (productId) => {
      dispatch(toggleWishlist(productId));
    },
    [dispatch]
  );

  const has = useCallback((productId) => ids.includes(productId), [ids]);

  const clear = useCallback(() => {
    dispatch(clearWishlist());
  }, [dispatch]);

  const api = useMemo(
    () => ({
      ids,
      toggle,
      has,
      clear,
    }),
    [ids, toggle, has, clear]
  );

  return selector ? selector(api) : api;
}
