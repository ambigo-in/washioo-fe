import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiRequest, getApiErrorMessage, withQuery } from "../../api/client";
import type {
  AdminPaymentSplitRequest,
  CleanerEarningsSummary,
  CleanerPaymentCollectRequest,
  CustomerPaymentStatus,
  Payment,
  PaymentStatus,
} from "../../types/apiTypes";

type PaymentState = {
  payments: Payment[];
  earnings: CleanerEarningsSummary | null;
  customerPaymentStatus: CustomerPaymentStatus | null;
  loading: boolean;
  error: string | null;
};

const initialState: PaymentState = {
  payments: [],
  earnings: null,
  customerPaymentStatus: null,
  loading: false,
  error: null,
};

export const collectPayment = createAsyncThunk(
  "payments/collect",
  async (
    payload: { bookingId: string; body: CleanerPaymentCollectRequest },
    { rejectWithValue },
  ) => {
    try {
      return await apiRequest<{ message: string; payment: Payment }>(
        `/bookings/${payload.bookingId}/payment/collect`,
        {
          method: "PATCH",
          auth: true,
          body: payload.body,
        },
      );
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const submitAdminSplit = createAsyncThunk(
  "payments/submitAdminSplit",
  async (
    payload: { paymentId: string; body: AdminPaymentSplitRequest },
    { rejectWithValue },
  ) => {
    try {
      return await apiRequest<{ message: string; payment: Payment }>(
        `/admin/payments/${payload.paymentId}/split`,
        {
          method: "PATCH",
          auth: true,
          body: payload.body,
        },
      );
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const loadAdminPayments = createAsyncThunk(
  "payments/loadAdminPayments",
  async (status: PaymentStatus | undefined, { rejectWithValue }) => {
    try {
      return await apiRequest<{
        message: string;
        payments: Payment[];
        total: number;
      }>(withQuery("/admin/payments", { status }), { auth: true });
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const loadCleanerEarnings = createAsyncThunk(
  "payments/loadCleanerEarnings",
  async (_, { rejectWithValue }) => {
    try {
      return await apiRequest<{
        message: string;
        earnings: CleanerEarningsSummary;
      }>("/cleaner/earnings", { auth: true });
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const loadCustomerPaymentStatus = createAsyncThunk(
  "payments/loadCustomerPaymentStatus",
  async (bookingId: string, { rejectWithValue }) => {
    try {
      return await apiRequest<{
        message: string;
        payment: CustomerPaymentStatus;
      }>(`/customer/bookings/${bookingId}/payment-status`, { auth: true });
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

const upsertPayment = (payments: Payment[], payment: Payment) => {
  const index = payments.findIndex((item) => item.id === payment.id);
  if (index === -1) payments.unshift(payment);
  else payments[index] = payment;
};

const paymentSlice = createSlice({
  name: "payments",
  initialState,
  reducers: {
    clearCustomerPaymentStatus(state) {
      state.customerPaymentStatus = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadAdminPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadAdminPayments.fulfilled, (state, action) => {
        state.payments = action.payload.payments;
        state.loading = false;
      })
      .addCase(collectPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(collectPayment.fulfilled, (state, action) => {
        upsertPayment(state.payments, action.payload.payment);
        state.loading = false;
      })
      .addCase(submitAdminSplit.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitAdminSplit.fulfilled, (state, action) => {
        upsertPayment(state.payments, action.payload.payment);
        state.loading = false;
      })
      .addCase(loadCleanerEarnings.fulfilled, (state, action) => {
        state.earnings = action.payload.earnings;
      })
      .addCase(loadCustomerPaymentStatus.pending, (state) => {
        state.error = null;
      })
      .addCase(loadCustomerPaymentStatus.fulfilled, (state, action) => {
        state.customerPaymentStatus = action.payload.payment;
      })
      .addMatcher(
        (action) =>
          action.type.startsWith("payments/") &&
          action.type.endsWith("/rejected"),
        (state, action: { payload?: unknown }) => {
          state.loading = false;
          state.error = String(action.payload ?? "Payment request failed.");
        },
      );
  },
});

export const { clearCustomerPaymentStatus } = paymentSlice.actions;
export default paymentSlice.reducer;
