import axiosClient from "./axiosClient";

const cartApi = {
  getCart: (userId) => axiosClient.get(`/cart/${userId}`),
  addItem: (userId, data) => axiosClient.post(`/cart/${userId}/items`, data),
  updateItem: (userId, productId, data) =>
    axiosClient.put(`/cart/${userId}/items/${productId}`, data),
  removeItem: (userId, productId) =>
    axiosClient.delete(`/cart/${userId}/items/${productId}`),
  clearCart: (userId) => axiosClient.delete(`/cart/${userId}`),
};

export default cartApi;
