// src/services/users.service.ts
import type { DropshipperUser } from "./admin.types";

const API_BASE = (import.meta.env.VITE_API_URL as string) ?? "http://localhost:8080/api";

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("admin_token") ?? ""}`,
});

export async function getDropshippers(): Promise<DropshipperUser[]> {
  const res = await fetch(`${API_BASE}/admin/dropshippers`, {
    headers: { ...authHeader() },
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Error al obtener la lista de dropshippers");
  }
  
  return res.json();
}