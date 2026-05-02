import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchServices } from "../../api/servicesApi";
import { getApiErrorMessage } from "../../api/client";
import type { ServiceCategory } from "../../types/apiTypes";

type ServicesState = {
  items: ServiceCategory[];
  total: number;
  loading: boolean;
  error: string | null;
};

const initialState: ServicesState = {
  items: [],
  total: 0,
  loading: false,
  error: null,
};

export const loadServices = createAsyncThunk(
  "services/loadServices",
  async (_, { rejectWithValue }) => {
    try {
      return await fetchServices();
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

const servicesSlice = createSlice({
  name: "services",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadServices.fulfilled, (state, action) => {
        state.items = action.payload.services;
        state.total = action.payload.total;
        state.loading = false;
      })
      .addCase(loadServices.rejected, (state, action) => {
        state.loading = false;
        state.error = String(action.payload ?? "Unable to load services.");
      });
  },
});

export default servicesSlice.reducer;
