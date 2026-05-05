import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  acceptAssignment,
  completeAssignment,
  fetchCleanerAssignments,
  fetchCleanerProfile,
  rejectAssignment,
  startAssignment,
  updateCleanerAvailability,
} from "../../api/cleanerApi";
import { getApiErrorMessage } from "../../api/client";
import type {
  Assignment,
  AssignmentActionPayload,
  CleanerProfile,
  CompleteAssignmentPayload,
} from "../../types/cleanerTypes";

type CleanerState = {
  profile: CleanerProfile | null;
  assignments: Assignment[];
  total: number;
  loading: boolean;
  error: string | null;
};

const initialState: CleanerState = {
  profile: null,
  assignments: [],
  total: 0,
  loading: false,
  error: null,
};

export const loadCleanerProfile = createAsyncThunk(
  "cleaner/loadProfile",
  async (_, { rejectWithValue }) => {
    try {
      return await fetchCleanerProfile();
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const setCleanerAvailability = createAsyncThunk(
  "cleaner/setAvailability",
  async (
    availability_status: CleanerProfile["availability_status"],
    { rejectWithValue },
  ) => {
    try {
      return await updateCleanerAvailability({ availability_status });
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const loadCleanerAssignments = createAsyncThunk(
  "cleaner/loadAssignments",
  async (status: string | undefined, { rejectWithValue }) => {
    try {
      return await fetchCleanerAssignments(status);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

const assignmentAction = (
  fn: (
    assignmentId: string,
    payload: AssignmentActionPayload | CompleteAssignmentPayload,
  ) => Promise<{ message: string; assignment: Assignment }>,
) =>
  createAsyncThunk(
    `cleaner/${fn.name}`,
    async (
      payload: {
        assignmentId: string;
        actionPayload?: AssignmentActionPayload | CompleteAssignmentPayload;
      },
      { rejectWithValue },
    ) => {
      try {
        return await fn(payload.assignmentId, payload.actionPayload ?? {});
      } catch (error) {
        return rejectWithValue(getApiErrorMessage(error));
      }
    },
  );

export const acceptCleanerAssignment = assignmentAction(acceptAssignment);
export const rejectCleanerAssignment = assignmentAction(rejectAssignment);
export const startCleanerAssignment = assignmentAction(startAssignment);
export const completeCleanerAssignment = assignmentAction(completeAssignment);

const upsertAssignment = (items: Assignment[], assignment: Assignment) => {
  const index = items.findIndex((item) => item.id === assignment.id);
  if (index === -1) items.unshift(assignment);
  else items[index] = assignment;
};

const cleanerSlice = createSlice({
  name: "cleaner",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadCleanerProfile.fulfilled, (state, action) => {
        state.profile = action.payload.cleaner;
      })
      .addCase(setCleanerAvailability.fulfilled, (state, action) => {
        state.profile = action.payload.cleaner;
      })
      .addCase(loadCleanerAssignments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadCleanerAssignments.fulfilled, (state, action) => {
        state.assignments = action.payload.assignments;
        state.total = action.payload.total;
        state.loading = false;
      })
      .addMatcher(
        (action) =>
          action.type.startsWith("cleaner/") &&
          action.type.endsWith("/fulfilled") &&
          action.payload?.assignment,
        (state, action: { payload: { assignment: Assignment } }) => {
          upsertAssignment(state.assignments, action.payload.assignment);
        },
      )
      .addMatcher(
        (action) =>
          action.type.startsWith("cleaner/") && action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.error = null;
        },
      )
      .addMatcher(
        (action) =>
          action.type.startsWith("cleaner/") && action.type.endsWith("/fulfilled"),
        (state) => {
          state.loading = false;
          state.error = null;
        },
      )
      .addMatcher(
        (action) =>
          action.type.startsWith("cleaner/") && action.type.endsWith("/rejected"),
        (state, action: { payload?: unknown }) => {
          state.loading = false;
          state.error = String(action.payload ?? "Cleaner request failed.");
        },
      );
  },
});

export default cleanerSlice.reducer;
