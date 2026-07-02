import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { boothApi } from "../../api/boothApi";
import { customerApi } from "../../api/customerApi";

// Fetch booths and active assignments
export const fetchBoothData = createAsyncThunk(
  "booth/fetchData",
  async (_, { rejectWithValue }) => {
    try {
      const response = await boothApi.getAssignments();
      return response.data; // contains { booths, boothAssignments }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Failed to load booth assignment data";
      return rejectWithValue(errorMsg);
    }
  }
);

// Fetch customers whose eventStatus is 'Checked-In' (ready for assignment)
export const fetchAvailableCustomers = createAsyncThunk(
  "booth/fetchAvailableCustomers",
  async (_, { rejectWithValue }) => {
    try {
      // Fetch list with status='Checked-In' filter
      const response = await customerApi.getCustomers({ status: "Checked-In" });
      return response.data;
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Failed to load checked-in customers";
      return rejectWithValue(errorMsg);
    }
  }
);

// Assign a customer to a booth
export const assignBooth = createAsyncThunk(
  "booth/assignBooth",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await boothApi.createAssignment(data);
      // Refresh the booths, assignments, and checked-in customers lists on success
      dispatch(fetchBoothData());
      dispatch(fetchAvailableCustomers());
      return response.data;
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Failed to create booth assignment";
      return rejectWithValue(errorMsg);
    }
  }
);

// Update/edit booth assignment
export const reassignBooth = createAsyncThunk(
  "booth/reassignBooth",
  async ({ id, data }, { rejectWithValue, dispatch }) => {
    try {
      const response = await boothApi.updateAssignment(id, data);
      dispatch(fetchBoothData());
      dispatch(fetchAvailableCustomers());
      return response.data;
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Failed to update booth assignment";
      return rejectWithValue(errorMsg);
    }
  }
);

// Cancel/Delete booth assignment
export const cancelAssignment = createAsyncThunk(
  "booth/cancelAssignment",
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await boothApi.deleteAssignment(id);
      dispatch(fetchBoothData());
      dispatch(fetchAvailableCustomers());
      return id;
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Failed to cancel booth assignment";
      return rejectWithValue(errorMsg);
    }
  }
);

const initialState = {
  booths: [],
  assignments: [],
  availableCustomers: [],
  loading: false,
  error: null,
  actionLoading: false,
  actionError: null,
};

const boothSlice = createSlice({
  name: "booth",
  initialState,
  reducers: {
    clearBoothErrors: (state) => {
      state.error = null;
      state.actionError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch main data
      .addCase(fetchBoothData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBoothData.fulfilled, (state, action) => {
        state.loading = false;
        state.booths = action.payload.booths || [];
        state.assignments = action.payload.boothAssignments || [];
        state.error = null;
      })
      .addCase(fetchBoothData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch available customers
      .addCase(fetchAvailableCustomers.fulfilled, (state, action) => {
        state.availableCustomers = action.payload || [];
      })

      // Mutative actions (Assign, Reassign, Cancel)
      .addCase(assignBooth.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(assignBooth.fulfilled, (state) => {
        state.actionLoading = false;
        state.actionError = null;
      })
      .addCase(assignBooth.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      })

      .addCase(reassignBooth.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(reassignBooth.fulfilled, (state) => {
        state.actionLoading = false;
        state.actionError = null;
      })
      .addCase(reassignBooth.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      })

      .addCase(cancelAssignment.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(cancelAssignment.fulfilled, (state) => {
        state.actionLoading = false;
        state.actionError = null;
      })
      .addCase(cancelAssignment.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      });
  },
});

export const { clearBoothErrors } = boothSlice.actions;
export default boothSlice.reducer;
