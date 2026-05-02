import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { getCurrentUser, logoutUser } from "../../api/authApi";
import { getApiErrorMessage } from "../../api/client";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  saveTokens,
} from "../../utils/tokenManager";
import type { AuthResponse } from "../../types/authTypes";
import type { UserProfile, UserRole } from "../../types/apiTypes";

type AuthState = {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
};

const initialState: AuthState = {
  user: null,
  isAuthenticated: !!getAccessToken(),
  isLoading: true,
  error: null,
};

export const hydrateSession = createAsyncThunk(
  "auth/hydrateSession",
  async (_, { rejectWithValue }) => {
    if (!getAccessToken()) return null;
    try {
      const response = await getCurrentUser();
      return response.user;
    } catch (error) {
      clearTokens();
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const refreshCurrentUser = createAsyncThunk(
  "auth/refreshCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getCurrentUser();
      return response.user;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const logoutSession = createAsyncThunk("auth/logoutSession", async () => {
  const refreshToken = getRefreshToken();
  if (refreshToken && getAccessToken()) {
    try {
      await logoutUser(refreshToken);
    } catch {
      // Local logout should still complete when the server token is stale.
    }
  }
  clearTokens();
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    applyAuthResponse(state, action: PayloadAction<AuthResponse>) {
      saveTokens(action.payload.access_token, action.payload.refresh_token);
      state.user = action.payload.user ?? null;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
    },
    setUser(state, action: PayloadAction<UserProfile | null>) {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload || !!getAccessToken();
    },
    clearAuthState(state) {
      clearTokens();
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(hydrateSession.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(hydrateSession.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = !!action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(hydrateSession.rejected, (state, action) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = String(action.payload ?? "Session expired.");
      })
      .addCase(refreshCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(logoutSession.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = null;
      });
  },
});

export const { applyAuthResponse, clearAuthState, setUser } = authSlice.actions;

export const selectRoles = (state: { auth: AuthState }): UserRole[] =>
  state.auth.user?.roles ?? [];

export default authSlice.reducer;
