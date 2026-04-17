import axios from "axios";

const axiosClient = axios.create({
  baseURL: `${API_URL}/api`, // Tạm trỏ thẳng vào User Service ở cổng 3001 thay vì Gateway (3000)
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

axiosClient.interceptors.response.use(
  (response) => {
    if (response && response.data) {
      return response.data;
    }
    return response;
  },
  (error) => {
    throw error;
  },
);

export default axiosClient;
