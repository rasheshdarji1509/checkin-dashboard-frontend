import axiosClient from "./axiosClient";

export const statusApi = {
  updateStatus: (data) => axiosClient.post("/customer-status", data),
  getStatusHistory: (customerId) => axiosClient.get(`/customer-status/${customerId}`),
};
