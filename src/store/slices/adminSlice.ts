import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  assignBooking,
  fetchAllBookings,
  fetchBookingsByStatus,
  fetchCleaners,
  fetchUsers,
  updateCleanerProfile,
} from "../../api/adminApi";
import { getApiErrorMessage, type PaginationParams } from "../../api/client";
import type { AdminBooking, AdminUser, CleanerFilters } from "../../types/adminTypes";
import type { BookingStatus } from "../../types/apiTypes";
import type { CleanerProfile } from "../../types/cleanerTypes";

type AdminState = {
  bookings: AdminBooking[];
  bookingsTotal: number;
  cleaners: CleanerProfile[];
  users: AdminUser[];
  loading: boolean;
  error: string | null;
};

const initialState: AdminState = {
  bookings: [],
  bookingsTotal: 0,
  cleaners: [],
  users: [],
  loading: false,
  error: null,
};

export const loadAdminBookings = createAsyncThunk(
  "admin/loadBookings",
  async (
    payload: (PaginationParams & { status?: BookingStatus | "all" }) | BookingStatus | "all" = "all",
    { rejectWithValue },
  ) => {
    try {
      const params =
        typeof payload === "string" ? { status: payload } : payload;
      const { status = "all", ...pagination } = params;
      return status === "all"
        ? await fetchAllBookings(pagination)
        : await fetchBookingsByStatus(status, pagination);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const loadAdminCleaners = createAsyncThunk(
  "admin/loadCleaners",
  async (filters: CleanerFilters | undefined, { rejectWithValue }) => {
    try {
      return await fetchCleaners(filters);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const approveCleaner = createAsyncThunk(
  "admin/approveCleaner",
  async (
    payload: { cleanerId: string; approval_status: CleanerProfile["approval_status"] },
    { rejectWithValue },
  ) => {
    try {
      return await updateCleanerProfile(payload.cleanerId, {
        approval_status: payload.approval_status,
      });
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const assignAdminBooking = createAsyncThunk(
  "admin/assignBooking",
  async (
    payload: { bookingId: string; cleanerId: string; cleanerNotes?: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await assignBooking(payload.bookingId, {
        cleaner_id: payload.cleanerId,
        cleaner_notes: payload.cleanerNotes,
      });
      return response;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const loadAdminUsers = createAsyncThunk(
  "admin/loadUsers",
  async (_, { rejectWithValue }) => {
    try {
      return await fetchUsers();
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

const upsertCleaner = (items: CleanerProfile[], cleaner: CleanerProfile) => {
  const index = items.findIndex((item) => item.id === cleaner.id);
  if (index === -1) items.unshift(cleaner);
  else items[index] = cleaner;
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadAdminBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadAdminBookings.fulfilled, (state, action) => {
        state.bookings = action.payload.bookings;
        state.bookingsTotal = action.payload.total;
        state.loading = false;
      })
      .addCase(loadAdminCleaners.fulfilled, (state, action) => {
        state.cleaners = action.payload.cleaners;
      })
      .addCase(approveCleaner.fulfilled, (state, action) => {
        upsertCleaner(state.cleaners, action.payload.cleaner);
      })
      .addCase(loadAdminUsers.fulfilled, (state, action) => {
        state.users = action.payload.users;
      })
      .addMatcher(
        (action) =>
          action.type.startsWith("admin/") && action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.error = null;
        },
      )
      .addMatcher(
        (action) =>
          action.type.startsWith("admin/") && action.type.endsWith("/fulfilled"),
        (state) => {
          state.loading = false;
          state.error = null;
        },
      )
      .addMatcher(
        (action) =>
          action.type.startsWith("admin/") && action.type.endsWith("/rejected"),
        (state, action: { payload?: unknown }) => {
          state.loading = false;
          state.error = String(action.payload ?? "Admin request failed.");
        },
      );
  },
});

export default adminSlice.reducer;
