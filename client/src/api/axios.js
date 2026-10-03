import axios from "axios";
import { storage } from "../utils/storage";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = storage.getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      storage.removeToken();
      // Only redirect if not on public portal or auth pages
      const publicPaths = ["/login", "/register", "/portal"];
      const isPublic = publicPaths.some((path) => window.location.pathname.startsWith(path));
      if (!isPublic && window.location.pathname !== "/") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;