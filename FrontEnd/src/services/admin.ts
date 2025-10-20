// src/services/admin.ts

// ===== Config =====
const API_BASE = (import.meta.env.VITE_API_URL as string) ?? "http://localhost:8080/api";
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("admin_token") ?? ""}` });

// ===== Tipos =====
export interface AdminProduct {
  id: string;
  sku: string;
  name: string;
  price: number;      // centavos
  stock: number;
  visible: boolean;
  imageUrl: string;
  category: string;   // Opción A: guardado como texto
  flavors: string[];
}

export interface CreateProductPayload {
  sku: string;
  name: string;
  price: number;      // centavos
  stock?: number;
  visible?: boolean;
  category?: string;  // nombre de la categoría
  image?: File | null;
  flavors?: string[];
}

export type PatchProductPayload = Partial<
  Pick<AdminProduct, "sku" | "name" | "price" | "stock" | "visible" | "category" | "flavors">
>;

// Categorías
export interface AdminCategory {
  id: string;
  name: string;
}

// ===== Productos =====
export async function getProducts(): Promise<AdminProduct[]> {
  const res = await fetch(`${API_BASE}/products`, {
    headers: { ...authHeader() },
  });
  if (!res.ok) throw new Error("GET /products failed");
  return res.json() as Promise<AdminProduct[]>;
}

export async function patchProduct(id: string, patch: PatchProductPayload): Promise<AdminProduct> {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
    },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error(`PATCH /products/${id} failed`);
  return res.json() as Promise<AdminProduct>;
}

export async function deleteProduct(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: "DELETE",
    headers: { ...authHeader() },
  });
  if (!res.ok && res.status !== 204) {
    throw new Error(`DELETE /products/${id} failed`);
  }
}

export async function patchProductImage(id: string, file: File): Promise<AdminProduct> {
  const fd = new FormData();
  fd.append("image", file); // backend: multer.single("image")

  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: "PATCH",
    headers: { ...authHeader() }, // NO pongas Content-Type manualmente
    body: fd,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<AdminProduct>;
}

export async function createProduct(payload: CreateProductPayload): Promise<AdminProduct> {
  const fd = new FormData();
  fd.append("sku", payload.sku);
  fd.append("name", payload.name);
  fd.append("price", String(payload.price));
  if (payload.stock != null)   fd.append("stock", String(payload.stock));
  if (payload.visible != null) fd.append("visible", String(payload.visible));
  if (payload.category)        fd.append("category", payload.category);
  if (payload.image)           fd.append("image", payload.image);
  if (payload.flavors?.length) {
    // backend acepta array repitiendo la key
    for (const f of payload.flavors) fd.append("flavors", f);
  }

  const res = await fetch(`${API_BASE}/products`, {
    method: "POST",
    headers: { ...authHeader() },
    body: fd,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<AdminProduct>;
}

// ===== Categorías =====
export async function getCategories(): Promise<AdminCategory[]> {
  const res = await fetch(`${API_BASE}/categories`, {
    headers: { ...authHeader() },
  });
  if (!res.ok) throw new Error("GET /categories failed");
  return res.json() as Promise<AdminCategory[]>;
}

export async function createCategory(name: string): Promise<AdminCategory> {
  const res = await fetch(`${API_BASE}/categories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
    },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<AdminCategory>;
}

export async function deleteCategoryById(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/categories/${id}`, {
    method: "DELETE",
    headers: { ...authHeader() },
  });
  if (!res.ok && res.status !== 204) {
    throw new Error(`DELETE /categories/${id} failed`);
  }
}
