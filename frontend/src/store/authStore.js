import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../services/api";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      setSession: (token, user) => {
        if (token) localStorage.setItem("folia_token", token);
        else localStorage.removeItem("folia_token");
        set({ token, user });
      },
      logout: () => {
        localStorage.removeItem("folia_token");
        set({ token: null, user: null });
      },
      hydrateUser: async () => {
        const token = get().token || localStorage.getItem("folia_token");
        if (!token) return null;
        try {
          const { data } = await api.get("/auth/me");
          set({ token, user: data });
          return data;
        } catch {
          localStorage.removeItem("folia_token");
          set({ token: null, user: null });
          return null;
        }
      },
    }),
    {
      name: "folia-auth",
      partialize: (s) => ({ token: s.token, user: s.user }),
    }
  )
);
