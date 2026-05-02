import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  cancelBooking,
  createBooking,
  fetchBookings,
  updateBooking,
} from "../../api/bookingApi";
import {
  createAddress,
  deleteAddress,
  fetchAddresses,
  updateAddress,
} from "../../api/addressApi";
import { getApiErrorMessage } from "../../api/client";
import type {
  Address,
  AddressPayload,
  BookingPayload,
  CustomerBooking,
} from "../../types/apiTypes";

type CustomerState = {
  bookings: CustomerBooking[];
  addresses: Address[];
  bookingsTotal: number;
  addressesTotal: number;
  loading: boolean;
  error: string | null;
};

const initialState: CustomerState = {
  bookings: [],
  addresses: [],
  bookingsTotal: 0,
  addressesTotal: 0,
  loading: false,
  error: null,
};

export const loadCustomerBookings = createAsyncThunk(
  "customer/loadBookings",
  async (_, { rejectWithValue }) => {
    try {
      return await fetchBookings();
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const loadAddresses = createAsyncThunk(
  "customer/loadAddresses",
  async (_, { rejectWithValue }) => {
    try {
      return await fetchAddresses();
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const saveAddress = createAsyncThunk(
  "customer/saveAddress",
  async (payload: AddressPayload, { rejectWithValue }) => {
    try {
      return await createAddress(payload);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const patchAddress = createAsyncThunk(
  "customer/patchAddress",
  async (
    payload: { addressId: string; changes: Partial<AddressPayload> },
    { rejectWithValue },
  ) => {
    try {
      return await updateAddress(payload.addressId, payload.changes);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const removeAddress = createAsyncThunk(
  "customer/removeAddress",
  async (addressId: string, { rejectWithValue }) => {
    try {
      await deleteAddress(addressId);
      return addressId;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const bookService = createAsyncThunk(
  "customer/bookService",
  async (payload: BookingPayload, { dispatch, rejectWithValue }) => {
    try {
      const response = await createBooking(payload);
      dispatch(loadCustomerBookings());
      return response;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const patchBooking = createAsyncThunk(
  "customer/patchBooking",
  async (
    payload: { bookingId: string; changes: Partial<BookingPayload> },
    { rejectWithValue },
  ) => {
    try {
      return await updateBooking(payload.bookingId, payload.changes);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const cancelCustomerBooking = createAsyncThunk(
  "customer/cancelBooking",
  async (bookingId: string, { rejectWithValue }) => {
    try {
      return await cancelBooking(bookingId);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

const upsert = <T extends { id: string }>(items: T[], item: T) => {
  const index = items.findIndex((entry) => entry.id === item.id);
  if (index === -1) items.unshift(item);
  else items[index] = item;
};

const customerSlice = createSlice({
  name: "customer",
  initialState,
  reducers: {
    setCustomerBookings(state, action: PayloadAction<CustomerBooking[]>) {
      state.bookings = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadCustomerBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadCustomerBookings.fulfilled, (state, action) => {
        state.bookings = action.payload.bookings;
        state.bookingsTotal = action.payload.total;
        state.loading = false;
      })
      .addCase(loadAddresses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadAddresses.fulfilled, (state, action) => {
        state.addresses = action.payload.addresses;
        state.addressesTotal = action.payload.total;
        state.loading = false;
      })
      .addCase(saveAddress.fulfilled, (state, action) => {
        upsert(state.addresses, action.payload.address);
      })
      .addCase(patchAddress.fulfilled, (state, action) => {
        upsert(state.addresses, action.payload.address);
      })
      .addCase(removeAddress.fulfilled, (state, action) => {
        state.addresses = state.addresses.filter(
          (address) => address.id !== action.payload,
        );
      })
      .addCase(patchBooking.fulfilled, (state, action) => {
        upsert(state.bookings, action.payload.booking);
      })
      .addCase(cancelCustomerBooking.fulfilled, (state, action) => {
        upsert(state.bookings, action.payload.booking);
      })
      .addMatcher(
        (action) =>
          action.type.startsWith("customer/") && action.type.endsWith("/rejected"),
        (state, action: { payload?: unknown }) => {
          state.loading = false;
          state.error = String(action.payload ?? "Customer request failed.");
        },
      );
  },
});

export const { setCustomerBookings } = customerSlice.actions;
export default customerSlice.reducer;
