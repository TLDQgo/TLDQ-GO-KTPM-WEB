import axiosClient from "./axiosClient";

const authApi = {
  login: (data) => {
    return axiosClient.post("users/login", data);
  },
  register: (data) => {
    return axiosClient.post("users/register", data);
  },
  registerSeller: (data) => {
    return axiosClient.post("users/seller/register", data);
  },
  upgradeSeller: (data) => {
    return axiosClient.post("users/seller/upgrade", data);
  },
  loginSeller: (data) => {
    return axiosClient.post("users/seller/login", data);
  },
};

export default authApi;
