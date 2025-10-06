// src/services/axios.ts
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://vapesprincys-web-page.onrender.com",
  timeout: 10000,
});

export default api;