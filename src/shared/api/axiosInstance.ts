import axios, { type InternalAxiosRequestConfig } from "axios";
import { storage } from "@/features/auth/lib/storage";

const api = axios.create({
  baseURL: "https://tu-api.com/api", // Recuerda cambiar esto
});

// Usamos InternalAxiosRequestConfig para tipar el parámetro config
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = storage.getToken();

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
