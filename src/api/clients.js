import axios from "axios";

const isLocalhost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.0.1";

// API Gateway URL
const API_BASE_URL = isLocalhost
  ? import.meta.env.VITE_API_URL || "http://localhost:3000"
  : "";

// Axios instance cho API Gateway
const axiosClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper to add auth token
const addAuthToken = (config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

axiosClient.interceptors.request.use((config) => addAuthToken(config));

axiosClient.interceptors.response.use(
  (response) => {
    if (response && response.data) {
      return response.data;
    }
    return response;
  },
  (error) => {
    throw error;
  }
);

// Re-export cho backward compatibility
export { axiosClient as userApiClient, axiosClient as productApiClient, axiosClient as orderApiClient };
export default axiosClient;
