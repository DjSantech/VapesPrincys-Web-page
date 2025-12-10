import type { AdminCategory } from "./admin.types";

const API_BASE =
  (import.meta.env.VITE_API_URL as string) ?? "http://localhost:8080/api";

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("admin_token") ?? ""}`,
});

// --------------------
// CATEGORÍAS
// --------------------

export async function getCategories(): Promise<AdminCategory[]> {
  const res = await fetch(`${API_BASE}/categories`, {
    headers: { ...authHeader() },
  });
  if (!res.ok) throw new Error("GET /categories failed");
  return res.json();
}

export async function createCategory(
  name: string
): Promise<AdminCategory> {
  const res = await fetch(`${API_BASE}/categories`, {
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

export async function patchCategory(
  id: string,
  patch: Partial<Pick<AdminCategory, "name" | "homeOrder">>
): Promise<AdminCategory> {
  const res = await fetch(`${API_BASE}/categories/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
    },
    body: JSON.stringify(patch),
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function patchCategoryImage(
  id: string,
  file: File
): Promise<AdminCategory> {
  const fd = new FormData();
  fd.append("image", file);

  const res = await fetch(`${API_BASE}/categories/${id}/image`, {
    method: "PATCH",
    headers: { ...authHeader() },
    body: fd,
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteCategoryById(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/categories/${id}`, {
    method: "DELETE",
    headers: { ...authHeader() },
  });

  if (!res.ok && res.status !== 204)
    throw new Error(`DELETE /categories/${id} failed`);
}
