import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  getCurrentUser,
  logoutUser,
  sendOtp,
  signIn,
  signUp,
  updateProfile,
} from "../../api/authApi";
import { getApiErrorMessage } from "../../api/client";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  getTokenActiveRole,
  saveTokens,
} from "../../utils/tokenManager";
import type {
  AccountType,
  AuthResponse,
  SignInPayload,
  SignUpPayload,
} from "../../types/authTypes";
import type { UserProfile, UserRole } from "../../types/apiTypes";

type AuthState = {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loading: boolean;
  resendLoading: boolean;
  activeRole: UserRole | null;
  error: string | null;
};

const initialState: AuthState = {
  user: null,
  isAuthenticated: !!getAccessToken(),
  isLoading: true,
  loading: false,
  resendLoading: false,
  activeRole: getTokenActiveRole(),
  error: null,
};

export const sendOtpRequest = createAsyncThunk(
  "auth/sendOtp",
  async (
    payload: { phoneNumber: string; accountType?: AccountType },
    { rejectWithValue },
  ) => {
    try {
      return await sendOtp(payload.phoneNumber, payload.accountType);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const resendOtp = createAsyncThunk(
  "auth/resendOtp",
  async (
    payload: { phoneNumber: string; accountType?: AccountType },
    { rejectWithValue },
  ) => {
    try {
      return await sendOtp(payload.phoneNumber, payload.accountType);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const signUpRequest = createAsyncThunk(
  "auth/signUp",
  async (
    payload: {
      body: SignUpPayload;
      accountType?: Exclude<AccountType, "admin">;
    },
    { rejectWithValue },
  ) => {
    try {
      return await signUp(payload.body, payload.accountType);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const signInRequest = createAsyncThunk(
  "auth/signIn",
  async (
    payload: { body: SignInPayload; accountType?: AccountType },
    { rejectWithValue },
  ) => {
    try {
      return await signIn(payload.body, payload.accountType);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const updateProfileRequest = createAsyncThunk(
  "auth/updateProfile",
  async (
    payload: { full_name?: string; email?: string; phone?: string },
    { rejectWithValue },
  ) => {
    try {
      return await updateProfile(payload);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

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
      state.loading = false;
      state.activeRole = action.payload.account_type ?? getTokenActiveRole();
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
      state.loading = false;
      state.resendLoading = false;
      state.activeRole = null;
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
        state.activeRole = action.payload ? getTokenActiveRole() : null;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(hydrateSession.rejected, (state, action) => {
        state.user = null;
        state.isAuthenticated = false;
        state.activeRole = null;
        state.isLoading = false;
        state.error = String(action.payload ?? "Session expired.");
      })
      .addCase(refreshCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.activeRole = getTokenActiveRole();
        state.error = null;
      })
      .addCase(logoutSession.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.loading = false;
        state.activeRole = null;
        state.error = null;
      })
      .addCase(resendOtp.pending, (state) => {
        state.resendLoading = true;
        state.error = null;
      })
      .addCase(resendOtp.fulfilled, (state) => {
        state.resendLoading = false;
      })
      .addCase(resendOtp.rejected, (state, action) => {
        state.resendLoading = false;
        state.error = String(action.payload ?? "Unable to resend OTP.");
      })
      .addCase(signUpRequest.fulfilled, (state, action) => {
        saveTokens(action.payload.access_token, action.payload.refresh_token);
        state.user = action.payload.user ?? null;
        state.isAuthenticated = true;
        state.activeRole = action.payload.account_type ?? getTokenActiveRole();
      })
      .addCase(signInRequest.fulfilled, (state, action) => {
        saveTokens(action.payload.access_token, action.payload.refresh_token);
        state.user = action.payload.user ?? null;
        state.isAuthenticated = true;
        state.activeRole = action.payload.account_type ?? getTokenActiveRole();
      })
      .addCase(updateProfileRequest.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addMatcher(
        (action) =>
          action.type.startsWith("auth/") &&
          action.type.endsWith("/pending") &&
          action.type !== resendOtp.pending.type &&
          action.type !== hydrateSession.pending.type,
        (state) => {
          state.loading = true;
          state.error = null;
        },
      )
      .addMatcher(
        (action) =>
          action.type.startsWith("auth/") &&
          action.type.endsWith("/fulfilled") &&
          action.type !== resendOtp.fulfilled.type &&
          action.type !== hydrateSession.fulfilled.type,
        (state) => {
          state.loading = false;
          state.error = null;
        },
      )
      .addMatcher(
        (action) =>
          action.type.startsWith("auth/") &&
          action.type.endsWith("/rejected") &&
          action.type !== resendOtp.rejected.type &&
          action.type !== hydrateSession.rejected.type,
        (state, action: { payload?: unknown }) => {
          state.loading = false;
          state.error = String(action.payload ?? "Authentication request failed.");
        },
      );
  },
});

export const { applyAuthResponse, clearAuthState, setUser } = authSlice.actions;

export const selectRoles = (state: { auth: AuthState }): UserRole[] =>
  state.auth.user?.roles ?? [];

export default authSlice.reducer;
