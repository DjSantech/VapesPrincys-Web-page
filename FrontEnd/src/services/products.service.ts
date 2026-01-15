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

// src/services/products.service.ts

export async function createProduct(
  payload: CreateProductPayload
): Promise<AdminProduct> {
  const fd = new FormData();

  // 1. Lógica de compresión e IMAGEN ÚNICA
  if (payload.image) {
    const options = {
      maxSizeMB: 0.8,
      maxWidthOrHeight: 1200,
      useWebWorker: true
    };
    try {
      const compressedFile = await imageCompression(payload.image, options);
      fd.append("image", compressedFile);
    } catch (error) {
      console.error("Error comprimiendo imagen", error);
      fd.append("image", payload.image); // Fallback
    }
  }

  // 2. Datos básicos
  fd.append("sku", payload.sku);
  fd.append("name", payload.name);
  if (payload.description) fd.append("description", payload.description);
  fd.append("price", String(payload.price));
  fd.append("dropshipperPrice", String(payload.dropshipperPrice));
  fd.append("stock", String(payload.stock ?? 0));
  fd.append("visible", String(payload.visible ?? true));
  fd.append("category", payload.category || "");
  fd.append("puffs", String(payload.puffs ?? 0));
  fd.append("ml", String(payload.ml ?? 0));

  // 3. Sabores (como elementos individuales)
  fd.append("hasFlavors", String(Boolean(payload.hasFlavors)));
  if (payload.hasFlavors && payload.flavors) {
    payload.flavors.forEach(f => fd.append("flavors", f));
  }

  // 4. Pluses (como elementos individuales, no Stringify)
  if (payload.pluses) {
    payload.pluses.forEach(p => fd.append("pluses", p));
  }

  // 5. NUEVO: Precios de mayoreo (Tiers)
  // Asegúrate de que CreateProductPayload incluya este campo
  if (payload.wholesaleRates) {
    fd.append("wholesaleRates", JSON.stringify(payload.wholesaleRates));
  }

  const res = await fetch(`${API_BASE}/products`, {
    method: "POST",
    headers: { ...authHeader() },
    body: fd, // El navegador pondrá el Content-Type correcto automáticamente
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
