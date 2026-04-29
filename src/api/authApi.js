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
  loginUser: (data) => {
    return axiosClient.post("users/user/login", data);
  },
  forgotPassword: (email) => {
    return axiosClient.post("users/forgot-password", { email });
  },
  resetPassword: (token, newPassword) => {
    return axiosClient.post("users/reset-password", { token, newPassword });
  },
  updateProfile: (data) => {
    return axiosClient.put("users/user/profile", data);
  },
  updateSellerProfile: (data) => {
    return axiosClient.put("users/seller/profile", data);
  },
  changePassword: (currentPassword, newPassword) => {
    return axiosClient.post("users/change-password", { currentPassword, newPassword });
  },
  getShopSetupStatus: () => {
    return axiosClient.get("users/seller/setup-status");
  },
  updateShopSettings: (data) => {
    return axiosClient.put("users/seller/settings", data);
  },
};

export default authApi;
