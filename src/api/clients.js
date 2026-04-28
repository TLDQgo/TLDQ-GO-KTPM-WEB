import axios from "axios";

const isLocalhost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.0.1";

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

axiosClient.interceptors.request.use((config) => {
  // #region debug-log
  console.log("[API Request]", config.method?.toUpperCase(), config.url);
  console.log("[API Full URL]", config.baseURL + config.url);
  // #endregion
  return addAuthToken(config);
});

axiosClient.interceptors.response.use(
  (response) => {
    if (response && response.data) {
      return response.data;
    }
    return response;
  },
  (error) => {
    // #region debug-log
    if (error.config) {
      console.log("[API Error]", error.config.method?.toUpperCase(), error.config.url);
      console.log("[API Error Full URL]", error.config.baseURL + error.config.url);
      console.log("[API Error]", error.message);
    }
    // #endregion
    throw error;
  }
);

// Re-export cho backward compatibility
export { axiosClient as userApiClient, axiosClient as productApiClient, axiosClient as orderApiClient };
export default axiosClient;
