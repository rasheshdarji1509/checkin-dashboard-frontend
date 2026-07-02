import axiosClient from "./axiosClient";

export const boothApi = {
  getAssignments: () => axiosClient.get("/booth-assignments"),
  createAssignment: (data) => axiosClient.post("/booth-assignments", data),
  updateAssignment: (id, data) => axiosClient.put(`/booth-assignments/${id}`, data),
  deleteAssignment: (id) => axiosClient.delete(`/booth-assignments/${id}`),
};
