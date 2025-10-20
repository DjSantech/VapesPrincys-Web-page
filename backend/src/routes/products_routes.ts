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

// Mapear documento -> DTO para el front (se deja igual)
const mapDoc = (p: any) => {
  const catId = p.category ? String(p.category._id ?? p.category) : "";
  const catName = p.category?.name ?? (typeof p.category === "string" ? p.category : "");
  return {
    id: String(p._id),
    sku: p.sku ?? "",
    name: p.name,
    price: p.price,
    stock: p.stock ?? 0,
    visible: p.isActive ?? true,
    imageUrl: p.imageUrl ?? "",
    category: catName,        // compat: sigue siendo texto para tu UI actual
    categoryId: catId,        // nuevo: id real por si lo quieres usar en el <select>
    flavors: Array.isArray(p.flavors) ? p.flavors : [],
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
/** GET /api/products  (lista, con filtros ?q= y ?category= ) */
// Ahora el filtro de category acepta id o nombre y evita CastError
// =========================
r.get("/", async (req, res) => {
  try {
    const { q, category } = req.query as { q?: string; category?: string };
    const filter: Record<string, unknown> = {};

    if (q && q.trim() !== "") {
      filter.name = { $regex: q.trim(), $options: "i" };
    }

    if (category && category.trim() !== "") {
      const cat = category.trim();
      if (isObjectId(cat)) {
        filter.category = cat;
      } else {
        const found = await Category.findOne({ name: cat }).lean();
        if (!found) return res.json([]);           // si no existe, evita cast error devolviendo vacío
        filter.category = found._id;
      }
    }

    const rows = await Product.find(filter).populate("category", "name")  .lean();
    res.json(rows.map(mapDoc));
  } catch (e) {
    console.error("GET /products error:", e);
    res.status(500).json({ error: "Error interno listando productos" });
  }
});

// =========================
// POST /api/products  (multipart/form-data)
// Campos: sku, name, price, stock?, visible?, category (id o nombre), flavors? (array o CSV), image? (File)
// =========================
r.post("/", upload.single("image"), async (req, res) => {
  try {
    const { sku, name, price, stock, category, visible, flavors } = req.body;

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

    // flavors puede venir como array o CSV
    let flavorsArr: string[] = [];
    if (Array.isArray(flavors)) {
      flavorsArr = (flavors as string[]).map(s => String(s).trim()).filter(Boolean);
    } else if (typeof flavors === "string") {
      flavorsArr = flavors.split(",").map(s => s.trim()).filter(Boolean);
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
    imageUrl,
    ...(catId === null ? {} : { category: catId }),
    isActive: visible !== undefined ? String(visible) === "true" : true,
    flavors: flavorsArr,
  });
  const saved = await Product.findById(created._id).populate("category", "name").lean();

    return res.status(201).json(mapDoc(created));
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
// =========================
r.patch("/:id", upload.single("image"), async (req, res) => {
  try {
    const { visible, flavors, ...rest } = req.body;

    const update: Record<string, any> = { ...rest };

    // visible puede venir como boolean o string
    if (typeof visible === "boolean") {
      update.isActive = visible;
    } else if (typeof visible === "string") {
      update.isActive = visible === "true";
    }

    // flavors: array o CSV o string vacío
    if (Array.isArray(flavors)) {
      update.flavors = (flavors as string[]).map(s => String(s).trim()).filter(Boolean);
    } else if (typeof flavors === "string") {
      update.flavors = flavors.split(",").map(s => s.trim()).filter(Boolean);
    }

    // categoría: resolver id/nombre/limpiar
    if (Object.prototype.hasOwnProperty.call(req.body, "category")) {
      const catId = await resolveCategoryId(req.body.category);
      if (catId === null) {
        update.$unset = { ...(update.$unset as any), category: 1 };
        delete update.category;
      } else {
        update.category = catId;
      }
    } else if (typeof update.category === "string") {
      // defensa extra por si quedó en rest
      delete update.category;
    }

    // Imagen (opcional) -> Cloudinary
    if (req.file) {
      const up = await uploadBufferToCloudinary(req.file.buffer, "vapes/products");
      // @ts-ignore
      update.imageUrl = up.secure_url as string;
    }

    const doc = await Product.findByIdAndUpdate(
    req.params.id,
    update,
    { new: true, runValidators: true }
    ).populate("category", "name");  // <-- NUEVO
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json(mapDoc(doc));

  } catch (e: any) {
    console.error("PATCH /products error:", e?.message, e?.errors || e);
    if (e?.message === "CATEGORY_NOT_FOUND") {
      return res.status(400).json({ error: "La categoría no existe" });
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
