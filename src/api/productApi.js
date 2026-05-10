import axiosClient from "./axiosClient";

const productApi = {
  getProductsWithPage: (page = 1) => {
    return axiosClient.get(`products/page?page=${page}`);
  },

  getProductsByCategoryName: (name, page = 1) => {
    return axiosClient.get(`products/category/name/${name}?page=${page}`);
  },

  getProductsBySeller: async (sellerId, page = 1) => {
    try {
      return await axiosClient.get(`products/seller/${sellerId}?page=${page}`);
    } catch (err) {
      if (err?.response?.status === 404) {
        console.warn("Product seller route 404, falling back to all products filter...");
        const res = await axiosClient.get("products");
        const list = Array.isArray(res) ? res : (res?.data ?? []);
        const filtered = list.filter((p) => String(p.seller_id) === String(sellerId));
        return {
          success: true,
          data: filtered,
          pagination: {
            page: 1,
            totalPages: 1,
            totalItems: filtered.length,
          }
        };
      }
      throw err;
    }
  },

  getById: (id) => axiosClient.get(`products/${id}`),

  createProduct: (formData) => {
    return axiosClient.post("products", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  update: (id, data) => axiosClient.put(`products/${id}`, data),

  delete: (id) => axiosClient.delete(`products/${id}`),

  getReviews: (productId) => axiosClient.get(`products/${productId}/reviews`),

  createReview: (productId, data) =>
    axiosClient.post(`products/${productId}/reviews`, data),
};

export default productApi;
