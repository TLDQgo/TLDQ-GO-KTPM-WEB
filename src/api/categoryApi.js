import axiosClient from "./axiosClient";

const categoryApi = {
  getAll: () => {
    return axiosClient.get("/products/categories");
  },
};

export default categoryApi;
