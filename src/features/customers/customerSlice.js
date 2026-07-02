import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { customerApi } from "../../api/customerApi";

// Async thunk to fetch all customers (with search & status filters)
export const fetchCustomers = createAsyncThunk(
  "customers/fetchCustomers",
  async (params, { rejectWithValue }) => {
    try {
      const response = await customerApi.getCustomers(params);
      return response.data;
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Failed to fetch customers list";
      return rejectWithValue(errorMsg);
    }
  }
);

// Async thunk to add a new customer
export const addCustomer = createAsyncThunk(
  "customers/addCustomer",
  async (data, { rejectWithValue }) => {
    try {
      const response = await customerApi.createCustomer(data);
      return response.data;
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Failed to add new customer";
      return rejectWithValue(errorMsg);
    }
  }
);

// Async thunk to edit an existing customer
export const editCustomer = createAsyncThunk(
  "customers/editCustomer",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await customerApi.updateCustomer(id, data);
      return response.data;
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Failed to update customer";
      return rejectWithValue(errorMsg);
    }
  }
);

// Async thunk to delete a customer
export const deleteCustomer = createAsyncThunk(
  "customers/deleteCustomer",
  async (id, { rejectWithValue }) => {
    try {
      await customerApi.deleteCustomer(id);
      return id; // Return deleted id to remove from state list
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Failed to delete customer";
      return rejectWithValue(errorMsg);
    }
  }
);

const initialState = {
  list: [],
  loading: false,
  error: null,
  actionLoading: false,
  actionError: null,
};

const customerSlice = createSlice({
  name: "customers",
  initialState,
  reducers: {
    clearCustomerErrors: (state) => {
      state.error = null;
      state.actionError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch list
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
        state.error = null;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add customer
      .addCase(addCustomer.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(addCustomer.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.list.unshift(action.payload); // Add new customer at start of list
        state.actionError = null;
      })
      .addCase(addCustomer.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      })

      // Edit customer
      .addCase(editCustomer.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(editCustomer.fulfilled, (state, action) => {
        state.actionLoading = false;
        const index = state.list.findIndex((c) => c._id === action.payload._id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
        state.actionError = null;
      })
      .addCase(editCustomer.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      })

      // Delete customer
      .addCase(deleteCustomer.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.list = state.list.filter((c) => c._id !== action.payload);
        state.actionError = null;
      })
      .addCase(deleteCustomer.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      });
  },
});

export const { clearCustomerErrors } = customerSlice.actions;
export default customerSlice.reducer;
