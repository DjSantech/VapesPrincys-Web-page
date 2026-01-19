// src/services/users.service.ts
import type { DropshipperUser } from "./admin.types";

export async function getDropshippers(): Promise<DropshipperUser[]> {
  const API_BASE = (import.meta.env.VITE_API_URL as string) || "http://localhost:10000/api";
  
  // 1. Obtenemos el token con la misma clave que usas en el logout
  const token = localStorage.getItem("AUTH_TOKEN"); 

  const res = await fetch(`${API_BASE}/admin/dropshippers`, {
    method: "GET",
    headers: { 
      "Content-Type": "application/json",
      // 2. Es Vital enviar el prefijo "Bearer "
      "Authorization": `Bearer ${token}` 
    },
  });

  if (!res.ok) {
    const errorData = await res.json();
    // Esto te ayudará a ver en la consola si es por Token o por no ser Admin
    throw new Error(errorData.message || "Error al obtener dropshippers");
  }

  return res.json();
}