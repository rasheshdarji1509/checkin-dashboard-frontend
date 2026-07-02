import axiosClient from "./axiosClient";

export const authApi = {
  // Relative to baseURL (/api), so this calls POST /api/login
  login: (data) => axiosClient.post("/login", data),
};