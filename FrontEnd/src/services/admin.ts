// src/services/admin.ts
import api from "./api";

// Reusa tu tipo Product si coincide
export async function getProducts(params?: { q?: string; category?: string }) {
  const { data } = await api.get("api/products", { params });
  return data;
}

export async function patchProduct(id: string, patch: Partial<{ price: number; stock: number; visible: boolean }>) {
  const { data } = await api.patch(`/products/${id}`, patch);
  return data;
}
