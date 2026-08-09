import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const TOKEN_KEY = "folia_token";

export const hydrateUser = createAsyncThunk(
  "auth/hydrateUser",
  async (_, { getState, rejectWithValue }) => {
    const api = (await import("../../services/api")).default;
    const token = getState().auth.token || localStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    localStorage.setItem(TOKEN_KEY, token);
    try {
      const { data } = await api.get("/auth/me");
      return { token, user: data };
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      return rejectWithValue(null);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: null,
    user: null,
  },
  reducers: {
    setSession(state, action) {
      const { token, user } = action.payload;
      state.token = token;
      state.user = user;
      if (token) localStorage.setItem(TOKEN_KEY, token);
      else localStorage.removeItem(TOKEN_KEY);
    },
    logout(state) {
      state.token = null;
      state.user = null;
      localStorage.removeItem(TOKEN_KEY);
    },
    clearAuth(state) {
      state.token = null;
      state.user = null;
      localStorage.removeItem(TOKEN_KEY);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(hydrateUser.fulfilled, (state, action) => {
        if (!action.payload) {
          state.token = null;
          state.user = null;
          return;
        }
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(hydrateUser.rejected, (state) => {
        state.token = null;
        state.user = null;
      });
  },
});

export const { setSession, logout, clearAuth } = authSlice.actions;
export default authSlice.reducer;
