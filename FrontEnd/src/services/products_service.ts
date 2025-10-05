// src/services/products_service.ts
import axios from "axios";
import type { Product } from "../types/Product";

const API = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

export async function getProducts(params?: { q?: string; category?: string }): Promise<Product[]> {
  // construir params solo si existen
  const p: Record<string, string> = {};
  if (params?.q) p.q = params.q;
  if (params?.category) p.category = params.category;

  const resp = await axios.get<Product[]>(`${API}/products`, Object.keys(p).length ? { params: p } : undefined);
  return resp.data;
}

export async function getProductById(id: string): Promise<Product> {
  const resp = await axios.get<Product>(`${API}/products/${id}`);
  return resp.data;
}
