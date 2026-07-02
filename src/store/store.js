import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import dashboardReducer from "../features/dashboard/dashboardSlice";
import customerReducer from "../features/customers/customerSlice";
import qrReducer from "../features/qrScanner/qrSlice";
import boothReducer from "../features/boothAssignment/boothSlice";
import statusReducer from "../features/customerStatus/statusSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    customers: customerReducer,
    qr: qrReducer,
    booth: boothReducer,
    status: statusReducer,
  },
});