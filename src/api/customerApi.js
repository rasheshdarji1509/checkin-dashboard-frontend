import axiosClient from "./axiosClient";

export const customerApi = {
  getCustomers: (params) => axiosClient.get("/customers", { params }),
  createCustomer: (data) => axiosClient.post("/customers", data),
  getCustomerById: (id) => axiosClient.get(`/customers/${id}`),
  updateCustomer: (id, data) => axiosClient.put(`/customers/${id}`, data),
  deleteCustomer: (id) => axiosClient.delete(`/customers/${id}`),
};
