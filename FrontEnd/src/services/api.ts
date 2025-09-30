import axios from "axios";
// import { getToken } from "@/lib/storage"; // opcional si manejas auth

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
  timeout: 10000,
});

// api.interceptors.request.use((config) => {
//   const token = getToken?.();
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });
