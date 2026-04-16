import axiosClient from "./axiosClient";

const authApi = {
  login: (data) => {
    return axiosClient.post("/users/login", data);
  },
  register: (data) => {
    return axiosClient.post("/users/register", data);
  },
};

export default authApi;
