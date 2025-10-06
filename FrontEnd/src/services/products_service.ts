// src/services/products_service.ts
import api from "./api";
import type { Product } from "../types/Product";

export async function getProducts(params?: { q?: string; category?: string }): Promise<Product[]> {
  const { data } = await api.get("/api/products", { params });
  return data;
}

export async function getProductById(id: string): Promise<Product> {
  const { data } = await api.get(`/api/products/${id}`);
  return data;
}
