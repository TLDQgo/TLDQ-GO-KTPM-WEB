import axiosClient from "./axiosClient";

const productApi = {
  getProductsWithPage: (page = 1) => {
    return axiosClient.get(`/products/page?page=${page}`);
  },
  delete: (id) => axiosClient.delete(`/products/${id}`),

  createProduct: (formData) => {
    return axiosClient.post("/products", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export default productApi;
