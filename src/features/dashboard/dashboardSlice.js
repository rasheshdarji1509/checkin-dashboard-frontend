import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { dashboardApi } from "../../api/dashboardApi";

// Async thunk to fetch dashboard summary from backend API
export const fetchDashboardSummary = createAsyncThunk(
  "dashboard/fetchSummary",
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.getSummary();
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to load dashboard summary";
      return rejectWithValue(errorMessage);
    }
  }
);

const initialState = {
  summary: {
    totalCustomers: 0,
    checkedInCustomers: 0,
    waitingCustomers: 0,
    assignedCustomers: 0,
    completedCustomers: 0,
    distribution: [],
  },
  loading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    clearDashboardError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload;
        state.error = null;
      })
      .addCase(fetchDashboardSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearDashboardError } = dashboardSlice.actions;
export default dashboardSlice.reducer;
