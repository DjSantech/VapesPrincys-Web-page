import type { AdminPlus } from "./admin.types";

const API_BASE =
  (import.meta.env.VITE_API_URL as string) ?? "http://localhost:8080/api";

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("admin_token") ?? ""}`,
});

// --------------------
// PLUSES
// --------------------

export async function getPluses(): Promise<AdminPlus[]> {
  const res = await fetch(`${API_BASE}/pluses`, {
    headers: { ...authHeader() },
  });
  if (!res.ok) throw new Error("GET /pluses failed");
  return res.json();
}

export async function createPlus(name: string): Promise<AdminPlus> {
  const res = await fetch(`${API_BASE}/pluses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
    },
    body: JSON.stringify({ name }),
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deletePlusById(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/pluses/${id}`, {
    method: "DELETE",
    headers: { ...authHeader() },
  });

  if (!res.ok && res.status !== 204)
    throw new Error(`DELETE /pluses/${id} failed`);
}
