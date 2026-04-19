import axiosClient from "./axiosClient";

const authApi = {
  login: (data) => {
    return axiosClient.post("users/login", data);
  },
  register: (data) => {
    return axiosClient.post("users/register", data);
  },
  loginSeller: (data) => {
    // Dùng route /login chung (đã deploy trên server),
    // validation role 'seller' được xử lý ở frontend sau khi nhận response
    return axiosClient.post("users/login", data);
  },
};

export default authApi;
