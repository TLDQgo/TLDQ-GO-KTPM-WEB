import axiosClient from "./axiosClient";

const productApi = {
  getProductsWithPage: (page = 1) => {
    return axiosClient.get(`products/page?page=${page}`);
  },
  getProductsBySeller: async (sellerId, page = 1) => {
    try {
      return await axiosClient.get(`products/seller/${sellerId}?page=${page}`);
    } catch (err) {
      if (err?.response?.status === 404) {
        console.warn("Product seller route 404, falling back to all products filter...");
        // Fallback: lấy tất cả sản phẩm và lọc client-side
        const res = await axiosClient.get("products");
        // axiosClient đã unwrap data nên res có thể là mảng trực tiếp hoặc { data: [] }
        const list = Array.isArray(res) ? res : (res?.data ?? []);
        const filtered = list.filter((p) => String(p.seller_id) === String(sellerId));
        
        return {
          success: true,
          data: filtered,
          pagination: {
            page: 1,
            totalPages: 1,
            totalItems: filtered.length,
            limit: 1000
          }
        };
      }
      throw err;
    }
  },
  delete: (id) => axiosClient.delete(`products/${id}`),

  update: (id, data) => axiosClient.put(`products/${id}`, data),

  createProduct: (formData) => {
    return axiosClient.post("products", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export default productApi;
