const API_BASE =
  (import.meta.env.VITE_API_URL as string) ?? "http://localhost:8080/api";

export async function getBanner() {
  const res = await fetch(`${API_BASE}/banner`);
  if (!res.ok) throw new Error("Error al obtener banner");
  return res.json();
}
