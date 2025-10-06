// src/services/axios.ts
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://vapesprincys-web-page.onrender.com/api/products/",
  timeout: 10000,
});

// (opcional) interceptores
// api.interceptors.request.use((config) => {
//   // agregar headers, etc.
//   return config;
// });

export default api; // 👈 export default
