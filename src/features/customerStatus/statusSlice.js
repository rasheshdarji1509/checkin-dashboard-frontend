import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { statusApi } from "../../api/statusApi";
import { fetchCustomers } from "../customers/customerSlice";

// Async thunk to fetch status history log for a specific customer
export const fetchStatusHistory = createAsyncThunk(
  "status/fetchHistory",
  async (customerId, { rejectWithValue }) => {
    try {
      const response = await statusApi.getStatusHistory(customerId);
      return response.data; // contains array of statusHistory objects
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "No status history found for this customer";
      return rejectWithValue(errorMsg);
    }
  }
);

// Async thunk to push a new status update transition
export const updateCustomerStatus = createAsyncThunk(
  "status/updateStatus",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await statusApi.updateStatus(data);
      
      // Refresh the status history log
      dispatch(fetchStatusHistory(data.customerId));
      
      // Also refresh the overall customer directory list so their eventStatus aligns
      dispatch(fetchCustomers());
      
      return response.data;
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Failed to update customer status";
      return rejectWithValue(errorMsg);
    }
  }
);

const initialState = {
  history: [],
  loading: false,
  error: null,
  actionLoading: false,
  actionError: null,
};

const statusSlice = createSlice({
  name: "status",
  initialState,
  reducers: {
    clearStatusErrors: (state) => {
      state.error = null;
      state.actionError = null;
    },
    clearStatusHistoryState: (state) => {
      state.history = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch History
      .addCase(fetchStatusHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.history = [];
      })
      .addCase(fetchStatusHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload || [];
        state.error = null;
      })
      .addCase(fetchStatusHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.history = [];
      })

      // Update Status
      .addCase(updateCustomerStatus.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(updateCustomerStatus.fulfilled, (state) => {
        state.actionLoading = false;
        state.actionError = null;
      })
      .addCase(updateCustomerStatus.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      });
  },
});

export const { clearStatusErrors, clearStatusHistoryState } = statusSlice.actions;
export default statusSlice.reducer;
