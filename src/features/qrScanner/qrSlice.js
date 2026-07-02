import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { qrApi } from "../../api/qrApi";

// Async thunk to verify QR code existence and usage
export const verifyCustomerQr = createAsyncThunk(
  "qr/verifyQr",
  async (qrCode, { rejectWithValue }) => {
    try {
      const response = await qrApi.verifyQrCode(qrCode);
      return response.data;
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "QR Code verification failed";
      return rejectWithValue(errorMsg);
    }
  }
);

// Async thunk to check in verified customer
export const checkInCustomer = createAsyncThunk(
  "qr/checkInCustomer",
  async (qrCode, { rejectWithValue }) => {
    try {
      const response = await qrApi.checkIn(qrCode);
      return response.data;
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Check-in request failed";
      return rejectWithValue(errorMsg);
    }
  }
);

const initialState = {
  scannedCustomer: null,
  loading: false,
  error: null,
  checkInLoading: false,
  checkInSuccess: false,
  checkInError: null,
};

const qrSlice = createSlice({
  name: "qr",
  initialState,
  reducers: {
    resetScannerState: (state) => {
      state.scannedCustomer = null;
      state.loading = false;
      state.error = null;
      state.checkInLoading = false;
      state.checkInSuccess = false;
      state.checkInError = null;
    },
    clearScannerErrors: (state) => {
      state.error = null;
      state.checkInError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Verify QR
      .addCase(verifyCustomerQr.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.scannedCustomer = null;
        state.checkInSuccess = false;
        state.checkInError = null;
      })
      .addCase(verifyCustomerQr.fulfilled, (state, action) => {
        state.loading = false;
        state.scannedCustomer = action.payload;
        state.error = null;
      })
      .addCase(verifyCustomerQr.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.scannedCustomer = null;
      })

      // Check-in
      .addCase(checkInCustomer.pending, (state) => {
        state.checkInLoading = true;
        state.checkInError = null;
        state.checkInSuccess = false;
      })
      .addCase(checkInCustomer.fulfilled, (state, action) => {
        state.checkInLoading = false;
        state.checkInSuccess = true;
        state.scannedCustomer = action.payload.customer || state.scannedCustomer;
        state.checkInError = null;
      })
      .addCase(checkInCustomer.rejected, (state, action) => {
        state.checkInLoading = false;
        state.checkInError = action.payload;
        state.checkInSuccess = false;
      });
  },
});

export const { resetScannerState, clearScannerErrors } = qrSlice.actions;
export default qrSlice.reducer;
