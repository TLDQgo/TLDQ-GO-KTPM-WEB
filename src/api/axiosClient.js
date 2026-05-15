import axios from "axios";

const isLocalhost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

// API Gateway URL
const API_BASE_URL = isLocalhost
  ? import.meta.env.VITE_API_URL
  : "";

const axiosClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
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
  }
);

axiosClient.interceptors.response.use(
  (response) => {
    if (response && response.data) {
      return response.data;
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refreshToken");

      if (refreshToken) {
        try {
          const res = await axios.post(
            `${API_BASE_URL}/api/users/refresh-token`,
            { refreshToken }
          );
          const newToken = res.data?.token;
          if (newToken) {
            localStorage.setItem("token", newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axiosClient(originalRequest);
          }
        } catch {
          // refresh thất bại — tiếp tục logout bên dưới
        }
      }

      // Xóa session và về trang login
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("auth-change"));
      window.location.href = "/login";
    }

    throw error;
  }
);

// Re-export cho backward compatibility
export { axiosClient as userApiClient, axiosClient as productApiClient, axiosClient as orderApiClient };
export default axiosClient;
