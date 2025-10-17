// src/services/admin.ts

const API = import.meta.env.VITE_API_URL as string; // ej: http://localhost:8080/api
const token = () => localStorage.getItem("admin_token") || "";

// ===== Tipos =====
export interface AdminProduct {
  id: string;
  sku: string;
  name: string;
  price: number;        // centavos
  stock: number;
  visible: boolean;
  imageUrl: string;
  category: string;
  flavors: string[];
}

export interface CreateProductPayload {
  sku: string;
  name: string;
  price: number;
  stock?: number;
  visible?: boolean;
  category?: string;
  image?: File | null;
  flavors?: string[];
}

export type PatchProductPayload = Partial<Pick<
  AdminProduct,
  "sku" | "name" | "price" | "stock" | "visible" | "category" | "flavors"
>>;

// ===== Servicios =====
export async function getProducts(): Promise<AdminProduct[]> {
  const r = await fetch(`${API}/products`, {
    headers: { Authorization: `Bearer ${token()}` },
  });
  if (!r.ok) throw new Error("GET /products failed");
  return r.json() as Promise<AdminProduct[]>;
}

export async function patchProduct(id: string, patch: PatchProductPayload): Promise<AdminProduct> {
  const r = await fetch(`${API}/products/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token()}`,
    },
    body: JSON.stringify(patch),
  });
  if (!r.ok) throw new Error("PATCH /products/:id failed");
  return r.json() as Promise<AdminProduct>;
}

// ⬇️ ESTE es el que te faltaba
export async function patchProductImage(id: string, file: File): Promise<AdminProduct> {
  const fd = new FormData();
  fd.append("image", file); // el backend debe leer 'image' con multer.single("image")

  const r = await fetch(`${API}/products/${id}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token()}` }, // NO pongas Content-Type, lo pone el browser
    body: fd,
  });

  if (!r.ok) throw new Error(await r.text());
  return r.json() as Promise<AdminProduct>;
}

export async function createProduct(payload: CreateProductPayload): Promise<AdminProduct> {
  const fd = new FormData();
  fd.append("sku", payload.sku);
  fd.append("name", payload.name);
  fd.append("price", String(payload.price));
  if (payload.stock != null)    fd.append("stock", String(payload.stock));
  if (payload.visible != null)  fd.append("visible", String(payload.visible));
  if (payload.category)         fd.append("category", payload.category);
  if (payload.image)            fd.append("image", payload.image);
  if (payload.flavors?.length) {
    // el backend acepta array repitiendo la key
    for (const f of payload.flavors) fd.append("flavors", f);
  }

  const r = await fetch(`${API}/products`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token()}` },
    body: fd,
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json() as Promise<AdminProduct>;
}
