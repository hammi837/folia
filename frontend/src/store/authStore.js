import { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSession as setSessionAction, logout as logoutAction, hydrateUser } from "./slices/authSlice";

/** Redux-backed auth hook (same selector API as the old Zustand store). */
export function useAuthStore(selector) {
  const dispatch = useDispatch();
  const token = useSelector((s) => s.auth.token);
  const user = useSelector((s) => s.auth.user);

  const setSession = useCallback(
    (nextToken, nextUser) => {
      dispatch(setSessionAction({ token: nextToken, user: nextUser }));
    },
    [dispatch]
  );

  const logout = useCallback(() => {
    dispatch(logoutAction());
  }, [dispatch]);

  const hydrate = useCallback(async () => {
    const result = await dispatch(hydrateUser());
    if (hydrateUser.fulfilled.match(result)) return result.payload?.user ?? null;
    return null;
  }, [dispatch]);

  const api = useMemo(
    () => ({
      token,
      user,
      setSession,
      logout,
      hydrateUser: hydrate,
    }),
    [token, user, setSession, logout, hydrate]
  );

  return selector ? selector(api) : api;
}
