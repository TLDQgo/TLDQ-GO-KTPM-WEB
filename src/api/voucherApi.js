import axiosClient from "./axiosClient";

const voucherApi = {
  create: (payload) => axiosClient.post("/vouchers", payload),
  getBySeller: (sellerId) => axiosClient.get(`/vouchers/seller/${sellerId}`),
  update: (id, payload) => axiosClient.put(`/vouchers/${id}`, payload),
  remove: (id, payload) =>
    axiosClient.delete(`/vouchers/${id}`, {
      data: payload,
    }),
};

export default voucherApi;
