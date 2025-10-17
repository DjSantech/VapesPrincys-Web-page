// src/services/admin.ts
const API = import.meta.env.VITE_API_URL; // ejemplo: http://localhost:8080/api
const token = () => localStorage.getItem("admin_token") || "";

// --- Definimos el tipo que devuelve el backend ---
export interface AdminProduct {
  id: string;
  name: string;
  price: number;
  stock?: number;
  visible?: boolean;
  imageUrl?: string;
  category?: string;
}

// --- GET ---
export async function getProducts(): Promise<AdminProduct[]> {
  const r = await fetch(`${API}/products`, {
    headers: { Authorization: `Bearer ${token()}` },
  });
  if (!r.ok) throw new Error("fail");
  const data: AdminProduct[] = await r.json();
  return data;
}

// --- PATCH ---
export async function patchProduct(
  id: string,
  patch: Partial<AdminProduct>
): Promise<AdminProduct> {
  const r = await fetch(`${API}/products/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token()}`,
    },
    body: JSON.stringify(patch),
  });
  if (!r.ok) throw new Error("fail");
  const data: AdminProduct = await r.json();
  return data;
}

// --- CREATE ---
export interface CreateProductPayload {
  name: string;
  price: number;
  stock?: number;
  visible?: boolean;
  category?: string;
  image?: File | null;
}

export async function createProduct(
  payload: CreateProductPayload
): Promise<AdminProduct> {
  const fd = new FormData();
  fd.append("name", payload.name);
  fd.append("price", String(payload.price));
  if (payload.stock != null) fd.append("stock", String(payload.stock));
  if (payload.visible != null) fd.append("visible", String(payload.visible));
  if (payload.category) fd.append("category", payload.category);
  if (payload.image) fd.append("image", payload.image);

  const r = await fetch(`${API}/products`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token()}` },
    body: fd,
  });
  if (!r.ok) throw new Error(await r.text());
  const data: AdminProduct = await r.json();
  return data;
}
