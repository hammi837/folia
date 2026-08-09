import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from "./slices/authSlice";
import cartReducer from "./slices/cartSlice";
import uiReducer from "./slices/uiSlice";
import wishlistReducer from "./slices/wishlistSlice";

// One-time migrate from old Zustand persist blobs (before Redux Persist reads storage)
try {
  const migrate = (zustandKey, persistKey, pick) => {
    if (localStorage.getItem(`persist:${persistKey}`)) return;
    const raw = localStorage.getItem(zustandKey);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    const state = parsed?.state;
    if (!state) return;
    localStorage.setItem(
      `persist:${persistKey}`,
      JSON.stringify({ ...pick(state), _persist: { version: -1, rehydrated: true } })
    );
  };
  migrate("folia-auth", "folia-auth", (s) => ({ token: s.token ?? null, user: s.user ?? null }));
  migrate("folia-cart", "folia-cart", (s) => ({ items: s.items || [] }));
  migrate("folia-wishlist", "folia-wishlist", (s) => ({ ids: s.ids || [] }));
} catch {
  /* ignore */
}

const authPersistConfig = {
  key: "folia-auth",
  storage,
  whitelist: ["token", "user"],
};

const cartPersistConfig = {
  key: "folia-cart",
  storage,
  whitelist: ["items"],
};

const wishlistPersistConfig = {
  key: "folia-wishlist",
  storage,
  whitelist: ["ids"],
};

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  cart: persistReducer(cartPersistConfig, cartReducer),
  ui: uiReducer,
  wishlist: persistReducer(wishlistPersistConfig, wishlistReducer),
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

// Keep axios token in sync after rehydrate / session changes
store.subscribe(() => {
  const token = store.getState().auth.token;
  if (token) localStorage.setItem("folia_token", token);
});
