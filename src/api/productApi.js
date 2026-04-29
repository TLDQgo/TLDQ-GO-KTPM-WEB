import { productApiClient } from "./axiosClient";

const productApi = {
  getProducts: () => {
    return productApiClient.get("/products");
  },
  getProductsWithPage: (page = 1) => {
    return productApiClient.get(`/products/page?page=${page}`);
  },
  getProductsBySeller: async (sellerId, page = 1) => {
    try {
      return await productApiClient.get(`/products/seller/${sellerId}?page=${page}`);
    } catch (err) {
      if (err?.response?.status === 404) {
        console.warn(
          "Product seller route 404, falling back to all products filter...",
        );
        const res = await productApiClient.get("/products");
        const list = Array.isArray(res) ? res : (res?.data ?? []);
        const filtered = list.filter(
          (p) => String(p.seller_id) === String(sellerId),
        );

        return {
          success: true,
          data: filtered,
          pagination: {
            page: 1,
            totalPages: 1,
            totalItems: filtered.length,
            limit: 1000,
          },
        };
      }
      throw err;
    }
  },
  delete: (id) => productApiClient.delete(`/products/${id}`),

  update: (id, data) => {
    if (data instanceof FormData) {
      return productApiClient.put(`/products/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }

    return productApiClient.put(`/products/${id}`, data);
  },

  createProduct: (formData) => {
    return productApiClient.post("/products", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // lấy theo tên category
  getByCategoryName: (name, page = 1) => {
    return productApiClient.get(
      `/products/category/name/${encodeURIComponent(name)}?page=${page}`,
    );
  },
};

export default productApi;
