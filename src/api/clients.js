import axios from "axios";

const isLocalhost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

// API Gateway URL
const API_BASE_URL = isLocalhost
  ? import.meta.env.VITE_API_URL || "http://localhost:3000"
  : "";

// #region debug-log
console.log("[API Config] isLocalhost:", isLocalhost);
console.log("[API Config] VITE_API_URL env:", import.meta.env.VITE_API_URL);
console.log("[API Config] Final API_BASE_URL:", API_BASE_URL);
// #endregion

// Axios instance cho API Gateway
const axiosClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// #region debug-log
console.log("[API Config] axiosClient baseURL:", axiosClient.defaults.baseURL);
// #endregion

// Helper to add auth token
const addAuthToken = (config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

axiosClient.interceptors.request.use(addAuthToken);

// Individual clients for compatibility if needed
export const userApiClient = axiosClient;
export const productApiClient = axiosClient;
export const orderApiClient = axiosClient;

export default axiosClient;
