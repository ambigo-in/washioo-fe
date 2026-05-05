import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getApiErrorMessage } from "../../api/client";
import { submitBookingRating } from "../../api/ratingApi";
import type { RatingCreateRequest } from "../../types/ratingTypes";

type RatingState = {
  loading: boolean;
  error: string | null;
};

const initialState: RatingState = {
  loading: false,
  error: null,
};

export const submitRating = createAsyncThunk(
  "rating/submitRating",
  async (
    payload: { bookingId: string; body: RatingCreateRequest },
    { rejectWithValue },
  ) => {
    try {
      return await submitBookingRating(payload.bookingId, payload.body);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

const ratingSlice = createSlice({
  name: "rating",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(submitRating.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitRating.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(submitRating.rejected, (state, action) => {
        state.loading = false;
        state.error = String(action.payload ?? "Rating request failed.");
      });
  },
});

export default ratingSlice.reducer;
