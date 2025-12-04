// src/api/axios.ts
import axios from "axios";
import { store } from "../../store"; // <-- IMPORTANT

const API_URL = import.meta.env.VITE_BACKEND_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const state = store.getState();
  const token = state.session.token; // <-- Get token from Redux

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error?.response?.status === 401) {
      // Clear session globally if needed
      store.dispatch({ type: "session/clearSession" });
      // Optionally redirect to login
    }
    return Promise.reject(error);
  }
);

export default api;
