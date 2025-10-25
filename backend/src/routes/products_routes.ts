// src/routes/products_routes.ts
import { Router } from "express";
import multer from "multer";
import mongoose from "mongoose";
import Product from "../models/Product";
import Category from "../models/Category";
import { uploadBufferToCloudinary } from "../lib/uploadBufferToCloudinary";

// Router y multer (usa memoria; no escribe archivos en disco)
const r = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Helpers de categoría
const isObjectId = (v: string) => mongoose.Types.ObjectId.isValid(v);

async function resolveCategoryId(input?: unknown) {
  if (typeof input !== "string") return undefined;   // no tocar categoría
  const val = input.trim();
  if (val === "") return null;                       // limpiar categoría
  if (isObjectId(val)) return val;                   // ya es id
  const cat = await Category.findOne({ name: val }).lean();
  if (!cat) throw new Error("CATEGORY_NOT_FOUND");
  return String(cat._id);
}

// Mapear documento -> DTO para el front
const mapDoc = (p: any) => {
  const catId = p.category ? String(p.category._id ?? p.category) : "";
  const catName = p.category?.name ?? (typeof p.category === "string" ? p.category : "");
  return {
    id: String(p._id),
    sku: p.sku ?? "",
    name: p.name,
    price: p.price,
    stock: p.stock ?? 0,
    puffs: p.puffs ?? 0,
    visible: p.isActive ?? true,
    imageUrl: p.imageUrl ?? "",
    category: catName,        // compat: sigue siendo texto para tu UI actual
    categoryId: catId,        // nuevo: id real por si lo quieres usar en el <select>
    flavors: Array.isArray(p.flavors) ? p.flavors : [],
    pluses: Array.isArray(p.pluses) ? p.pluses : [], // ✅ incluir pluses
  };
};

// =========================
// GET /api/products/:id  (detalle)
// =========================
r.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }
    const doc = await Product.findById(id)
      .populate("category", "name").lean();
    if (!doc) return res.status(404).json({ error: "Not found" });
    return res.json(mapDoc(doc));
  } catch (e) {
    console.error("GET /products/:id error:", e);
    return res.status(500).json({ error: "Error interno" });
  }
});

// =========================
/** GET /api/products  (lista, con filtros ?q= y ?category= ó ?categoryId= ) */
// Acepta:
//   - ?q= (búsqueda por nombre)
//   - ?category= (id ObjectId o nombre de categoría)
//   - ?categoryId= (id ObjectId)  ← compat para tu ProductDetailPage actual
// =========================
r.get("/", async (req, res) => {
  try {
    const { q, category, categoryId } = req.query as { q?: string; category?: string; categoryId?: string };
    const filter: Record<string, unknown> = {};

    if (q && q.trim() !== "") {
      filter.name = { $regex: q.trim(), $options: "i" };
    }

    // Soporta ambos: categoryId tiene prioridad si viene
    const catParam =
      categoryId && categoryId.trim() !== ""
        ? categoryId.trim()
        : category && category.trim() !== ""
          ? category.trim()
          : "";

    if (catParam) {
      if (isObjectId(catParam)) {
        filter.category = catParam;
      } else {
        const found = await Category.findOne({ name: catParam }).lean();
        if (!found) return res.json([]); // evita cast error devolviendo vacío si no existe
        filter.category = found._id;
      }
    }

    const rows = await Product.find(filter).populate("category", "name").lean();
    res.json(rows.map(mapDoc));
  } catch (e) {
    console.error("GET /products error:", e);
    res.status(500).json({ error: "Error interno listando productos" });
  }
});

// =========================
// POST /api/products  (multipart/form-data)
// Campos: sku, name, price, stock?, visible?, category (id o nombre), flavors? (array o CSV), puffs?, image? (File)
// Además: pluses? (string JSON o array)
// =========================
r.post("/", upload.single("image"), async (req, res) => {
  try {
    const { sku, name, price, stock, category, visible, flavors, puffs } = req.body;

    if (!sku)  return res.status(400).json({ error: "El SKU es obligatorio" });
    if (!name) return res.status(400).json({ error: "El nombre es obligatorio" });

    const priceNum = Number(price);
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      return res.status(400).json({ error: "Precio inválido" });
    }

    const stockNum = stock != null ? Number(stock) : 0;
    if (!Number.isFinite(stockNum) || stockNum < 0) {
      return res.status(400).json({ error: "Stock inválido" });
    }

    const puffsNum = puffs != null ? Number(puffs) : 0;
    if (!Number.isFinite(puffsNum) || puffsNum < 0) {
      return res.status(400).json({ error: "Puffs inválido" });
    }

    // flavors: array o CSV
    let flavorsArr: string[] = [];
    if (Array.isArray(flavors)) {
      flavorsArr = (flavors as string[]).map(s => String(s).trim()).filter(Boolean);
    } else if (typeof flavors === "string") {
      flavorsArr = flavors.split(",").map(s => s.trim()).filter(Boolean);
    }

    // pluses: JSON (string) o array
    let plusesArr: string[] = [];
    try {
      if (Array.isArray((req.body as any).pluses)) {
        plusesArr = ((req.body as any).pluses as string[]).map(s => String(s).trim()).filter(Boolean);
      } else if (typeof (req.body as any).pluses === "string") {
        const parsed = JSON.parse((req.body as any).pluses as string);
        if (Array.isArray(parsed)) {
          plusesArr = parsed.map(s => String(s).trim()).filter(Boolean);
        }
      }
    } catch {
      plusesArr = [];
    }

    // resolver categoría (id o nombre)
    const catId = await resolveCategoryId(category);

    // Imagen (opcional) -> Cloudinary
    let imageUrl = "";
    if (req.file) {
      const up = await uploadBufferToCloudinary(req.file.buffer, "vapes/products");
      // @ts-ignore tipos de cloudinary
      imageUrl = up.secure_url as string;
    }

    const created = await Product.create({
      sku: String(sku).trim().toUpperCase(),
      name: String(name).trim(),
      price: priceNum,
      stock: stockNum,
      puffs: puffsNum,
      imageUrl,
      ...(catId === null ? {} : { category: catId }),
      isActive: visible !== undefined ? String(visible) === "true" : true,
      flavors: flavorsArr,
      pluses: plusesArr, // ✅ guardar pluses
    });

    const saved = await Product.findById(created._id).populate("category", "name").lean();
    return res.status(201).json(mapDoc(saved ?? created));
  } catch (e: any) {
    console.error("POST /products error:", e?.message, e?.errors || e);
    if (e?.message === "CATEGORY_NOT_FOUND") {
      return res.status(400).json({ error: "La categoría no existe" });
    }
    if (e?.code === 11000 && e?.keyPattern?.sku) {
      return res.status(409).json({ error: "SKU duplicado" });
    }
    if (e?.name === "ValidationError") {
      return res.status(400).json({ error: e.message });
    }
    return res.status(500).json({ error: "Error interno creando producto" });
  }
});

// =========================
// PATCH /api/products/:id  (JSON o multipart)
// Acepta cambios parciales y/o imagen (campo 'image')
// category: id, nombre, "" (limpiar) o undefined (no tocar)
// Además: pluses? (string JSON o array)
// =========================
r.patch("/:id", upload.single("image"), async (req, res) => {
  try {
    const { visible, flavors, price, stock, puffs, sku, name, ...rest } = req.body;

    const update: Record<string, any> = { ...rest };

    // 🔹 Normaliza SKU si viene
    if (sku !== undefined) {
      const next = String(sku).trim().toUpperCase();
      if (!next) return res.status(400).json({ error: "El SKU no puede quedar vacío" });
      update.sku = next;
    }

    // 🔹 Normaliza name si quieres (igual que en POST)
    if (name !== undefined) {
      const next = String(name).trim();
      if (!next) return res.status(400).json({ error: "El nombre no puede quedar vacío" });
      update.name = next;
    }

    // 🔹 Coerciones numéricas seguras (tu código existente)
    if (price !== undefined) {
      const n = Number(price);
      if (!Number.isFinite(n) || n < 0) return res.status(400).json({ error: "Precio inválido" });
      update.price = Math.round(n);
    }
    if (stock !== undefined) {
      const n = Number(stock);
      if (!Number.isFinite(n) || n < 0) return res.status(400).json({ error: "Stock inválido" });
      update.stock = Math.max(0, Math.round(n));
    }
    if (puffs !== undefined) {
      const n = Number(puffs);
      if (!Number.isFinite(n) || n < 0) return res.status(400).json({ error: "Puffs inválido" });
      update.puffs = Math.max(0, Math.round(n));
    }

    // 🔹 visible (tu código existente)
    if (typeof visible === "boolean") {
      update.isActive = visible;
    } else if (typeof visible === "string") {
      update.isActive = visible === "true";
    }

    // 🔹 flavors (tu código existente)
    if (Array.isArray(flavors)) {
      update.flavors = (flavors as string[]).map(s => String(s).trim()).filter(Boolean);
    } else if (typeof flavors === "string") {
      update.flavors = flavors.split(",").map(s => s.trim()).filter(Boolean);
    }

    // 🔹 pluses y categoría (tu código existente) …
    // … (no lo repito por brevedad)

    // 🔹 Imagen (tu código existente)
    if (req.file) {
      const up = await uploadBufferToCloudinary(req.file.buffer, "vapes/products");
      // @ts-ignore
      update.imageUrl = up.secure_url as string;
    }

    const doc = await Product.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true, context: "query" } // 👈 importante
    ).populate("category", "name");

    if (!doc) return res.status(404).json({ error: "Not found" });
    return res.json(mapDoc(doc));
  } catch (e: any) {
    console.error("PATCH /products error:", e?.message, e?.errors || e);
    if (e?.message === "CATEGORY_NOT_FOUND") {
      return res.status(400).json({ error: "La categoría no existe" });
    }
    // 👇 Manejo de duplicado de SKU
    if (e?.code === 11000 && e?.keyPattern?.sku) {
      return res.status(409).json({ error: "SKU duplicado" });
    }
    if (e?.name === "ValidationError") {
      return res.status(400).json({ error: e.message });
    }
    return res.status(500).json({ error: "Error interno actualizando producto" });
  }
});


// =========================
// DELETE /api/products/:id
// =========================
r.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const doc = await Product.findByIdAndDelete(id);
    if (!doc) return res.status(404).json({ error: "Not found" });

    return res.status(204).send();
  } catch (e) {
    console.error("DELETE /products/:id error:", e);
    return res.status(500).json({ error: "Error interno eliminando producto" });
  }
});

export default r;
