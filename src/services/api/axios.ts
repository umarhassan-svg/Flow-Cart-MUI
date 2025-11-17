// src/api/axios.ts
import axios from "axios";

const API_URL =  "http://localhost:5000";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Attach auth token (if present) to every request.
 * Token is expected to be stored in localStorage under "token".
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Global response interceptor:
 * - Remove local auth on 401 (simple strategy; customize if you have refresh tokens)
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      // Basic cleanup on unauthorized
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // optionally trigger UI redirect to /login here
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
