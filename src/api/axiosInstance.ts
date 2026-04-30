import axios from "axios";
// import { API_BASE_URL } from "../utils/constants";
import { tokenStorage } from "../utils/tokenStorage";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8000",
//   import.meta.env.VITE_API_BASE_URL || API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
