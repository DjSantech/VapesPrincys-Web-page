// src/services/admin.ts

// ===== Config =====
const API_BASE = (import.meta.env.VITE_API_URL as string) ?? "http://localhost:8080/api";
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("admin_token") ?? ""}` });

console.info("[admin.ts] API_BASE =", API_BASE);

// ===== Tipos =====
export interface AdminProduct {
    id: string;
    sku: string;
    name: string;
    description?: string;
    price: number; // centavos
    stock: number;
    puffs: number;
    ml: number;
    visible: boolean;
    imageUrl: string;
    category: string;  // nombre de categoría (texto)
    flavors: string[];
    hasFlavors: boolean; // 👈 NUEVO
    pluses?: string[]; // nombres de plus asignados
}

export interface CreateProductPayload {
    sku: string;
    name: string;
    description?: string;
    price: number; // centavos
    stock?: number;
    puffs: number;
    ml: number;
    visible?: boolean;
    category?: string; 
    image?: File | null;
    flavors?: string[];
    hasFlavors: boolean;
    pluses?: string[]; // nombres de plus
}

export type PatchProductPayload = Partial<
    Pick<
        AdminProduct,
        | "sku"
        | "name"
        | "description"
        | "price"
        | "stock"
        | "puffs"
        | "visible"
        | "category"
        | "flavors"
        | "pluses"
        | "ml"
        | "hasFlavors"
    >
>;

// ------------------------------------------------------------------

// ===== Categorías =====
export interface AdminCategory {
    id: string;
    name: string;
    homeOrder?: number; // orden para el Home (menor = primero)
    imageUrl?: string; // 👈 AGREGADO: URL de la imagen de la categoría
}

// ------------------------------------------------------------------

// ===== Pluses =====
export interface AdminPlus {
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

    // 👇 muestra el mensaje exacto del backend si hay error
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Error ${res.status} actualizando producto`);
    }

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

    const res = await fetch(`${API_BASE}/products/${id}/image`, {
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
    if (payload.description != null) fd.append("description", payload.description);
    fd.append("price", String(payload.price));
    if (payload.stock != null) fd.append("stock", String(payload.stock));
    if (payload.visible != null) fd.append("visible", String(payload.visible));
    if (payload.category) fd.append("category", payload.category);
    if (payload.image)  fd.append("image", payload.image);

    // ⬇️ puffs y ml (requeridos según tu tipo)
    fd.append("puffs", String(payload.puffs));
    fd.append("ml", String(payload.ml));

    // 👇 NUEVO: toggle de sabores
    fd.append("hasFlavors", String(Boolean(payload.hasFlavors)));
    if (payload.hasFlavors && payload.flavors && payload.flavors.length > 0) {
        for (const f of payload.flavors) fd.append("flavors", f);
    }

    // Enviar pluses como JSON (recomendado para multipart)
    fd.append("pluses", JSON.stringify(payload.pluses ?? []));

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
    // El backend debe incluir 'imageUrl' en la respuesta
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
    if (!res.ok) throw new Error(`PATCH /categories/${id} failed`);
    return res.json() as Promise<AdminCategory>;
}

/** * 🚨 NUEVA FUNCIÓN: Actualiza la imagen de una categoría.
 * Requiere que el backend tenga un endpoint PATCH /categories/:id/image que procese la imagen.
 */
export async function patchCategoryImage(id: string, file: File): Promise<AdminCategory> {
    const fd = new FormData();
    fd.append("image", file);

    const res = await fetch(`${API_BASE}/categories/${id}/image`, {
        method: "PATCH",
        headers: { ...authHeader() },
        body: fd,
    });
    
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Error ${res.status} actualizando imagen de categoría`);
    }
    
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

// ===== Pluses =====
export async function getPluses(): Promise<AdminPlus[]> {
    const res = await fetch(`${API_BASE}/pluses`, {
        headers: { ...authHeader() },
    });
    if (!res.ok) throw new Error("GET /pluses failed");
    return res.json() as Promise<AdminPlus[]>;
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
    return res.json() as Promise<AdminPlus>;
}

export async function deletePlusById(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/pluses/${id}`, {
        method: "DELETE",
        headers: { ...authHeader() },
    });
    if (!res.ok && res.status !== 204) {
        throw new Error(`DELETE /pluses/${id} failed`);
    }
}