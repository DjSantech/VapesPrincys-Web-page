import { api } from "./api";   // ← este api es tu axios preconfigurado
import type { Product } from "../types/Product";

// Obtener lista de productos con filtros opcionales
export const getProducts = async (q?: string, page = 1, limit = 12) => {
  const { data } = await api.get<{ items: Product[]; total: number }>("/products", {
    params: { q, page, limit },
  });
  return data;
};

// Obtener un producto por id
export const getProductById = async (id: string) => {
  const { data } = await api.get<Product>(`/products/${id}`);
  return data;
};
