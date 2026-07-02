import axiosClient from "./axiosClient";

export const qrApi = {
  verifyQrCode: (qrCode) => axiosClient.get(`/qr-codes/verify/${qrCode}`),
  checkIn: (qrCode) => axiosClient.post("/qr-codes/check-in", { qrCode }),
};
