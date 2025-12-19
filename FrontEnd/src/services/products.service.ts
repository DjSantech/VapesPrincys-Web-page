import imageCompression from "browser-image-compression";
import type {
  AdminProduct,
  CreateProductPayload,
  PatchProductPayload,
} from "./admin.types";

const API_BASE =
  (import.meta.env.VITE_API_URL as string) ?? "http://localhost:8080/api";

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("admin_token") ?? ""}`,
});

// --------------------
// PRODUCTOS
// --------------------

export async function getProducts(): Promise<AdminProduct[]> {
  const res = await fetch(`${API_BASE}/products`, {
    headers: { ...authHeader() },
  });
  if (!res.ok) throw new Error("GET /products failed");
  return res.json();
}

export async function createProduct(
  payload: CreateProductPayload
): Promise<AdminProduct> {
  const fd = new FormData();
  // Lógica de compresión
  if (payload.image) {
    const options = {
      maxSizeMB: 0.8, // Máximo 800KB
      maxWidthOrHeight: 1200,
      useWebWorker: true
    };
    try {
      const compressedFile = await imageCompression(payload.image, options);
      fd.append("image", compressedFile);
    } catch (error) {
      console.error("Error comprimiendo imagen", error);
      fd.append("image", payload.image); // fallback si falla
    }
  }
  fd.append("sku", payload.sku);
  fd.append("name", payload.name);
  if (payload.description) fd.append("description", payload.description);
  fd.append("price", String(payload.price));
  if (payload.stock != null) fd.append("stock", String(payload.stock));
  if (payload.visible != null) fd.append("visible", String(payload.visible));
  if (payload.category) fd.append("category", payload.category);
  if (payload.image) fd.append("image", payload.image);

  fd.append("puffs", String(payload.puffs));
  fd.append("ml", String(payload.ml));

  fd.append("hasFlavors", String(Boolean(payload.hasFlavors)));
  if (payload.hasFlavors && payload.flavors) {
    for (const f of payload.flavors) fd.append("flavors", f);
  }

  fd.append("pluses", JSON.stringify(payload.pluses ?? []));

  const res = await fetch(`${API_BASE}/products`, {
    method: "POST",
    headers: { ...authHeader() },
    body: fd,
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function patchProduct(
  id: string,
  patch: PatchProductPayload
): Promise<AdminProduct> {
  const res = await fetch(`${API_BASE}/products/${id}`, {
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

export async function patchProductImage(
  id: string,
  file: File
): Promise<AdminProduct> {
  const fd = new FormData();
  fd.append("image", file);

  const res = await fetch(`${API_BASE}/products/${id}/image`, {
    method: "PATCH",
    headers: { ...authHeader() },
    body: fd,
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteProduct(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: "DELETE",
    headers: { ...authHeader() },
  });

  if (!res.ok && res.status !== 204)
    throw new Error(`DELETE /products/${id} failed`);
}
