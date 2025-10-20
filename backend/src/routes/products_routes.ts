// src/routes/products_routes.ts
import { Router } from "express";
import multer from "multer";
import mongoose from "mongoose";
import Product from "../models/Product";
import { uploadBufferToCloudinary } from "../lib/uploadBufferToCloudinary";

// Router y multer (usa memoria; no escribe archivos en disco)
const r = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Mapear documento -> DTO para el front
const mapDoc = (p: any) => ({
  id: String(p._id),
  sku: p.sku ?? "",
  name: p.name,
  price: p.price,
  stock: p.stock ?? 0,
  visible: p.isActive ?? true,
  imageUrl: p.imageUrl ?? "",
  category: typeof p.category === "string" ? p.category : "", // <-- texto
  flavors: Array.isArray(p.flavors) ? p.flavors : [],
});




// =========================
// GET /api/products/:id  (detalle)
// =========================
r.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }
    const doc = await Product.findById(id).lean();
    if (!doc) return res.status(404).json({ error: "Not found" });
    return res.json(mapDoc(doc));
  } catch (e) {
    console.error("GET /products/:id error:", e);
    return res.status(500).json({ error: "Error interno" });
  }
});

// =========================
// GET /api/products  (lista, con filtros ?q= y ?category= )
// =========================
r.get("/", async (req, res) => {
  try {
    const { q, category } = req.query as { q?: string; category?: string };
    const filter: Record<string, unknown> = {};

    if (q && q.trim() !== "") {
      filter.name = { $regex: q.trim(), $options: "i" };
    }

    // categoría como string (match exacto; si quieres case-insensitive exacto usa regex)
    if (category && category.trim() !== "") {
      filter.category = category.trim();
      // Alternativa exacta case-insensitive:
      // filter.category = { $regex: `^${category.trim()}$`, $options: "i" };
    }

    const rows = await Product.find(filter).lean();
    res.json(rows.map(mapDoc));
  } catch (e) {
    console.error("GET /products error:", e);
    res.status(500).json({ error: "Error interno listando productos" });
  }
});

// =========================
// POST /api/products  (multipart/form-data)
// Campos: sku, name, price, stock?, visible?, category (texto), flavors? (array o CSV), image? (File)
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

    // categoría como texto
    const categoryStr = typeof category === "string" ? category.trim() : "";

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
      category: categoryStr, // <-- guarda texto
      isActive: visible !== undefined ? String(visible) === "true" : true,
      flavors: flavorsArr,
    });

    return res.status(201).json(mapDoc(created));
  } catch (e: any) {
    console.error("POST /products error:", e?.message, e?.errors || e);
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
// =========================
r.patch("/:id", upload.single("image"), async (req, res) => {
  try {
    const { visible, flavors, ...rest } = req.body;

    const update: Record<string, unknown> = { ...rest };

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

    // category: string (limpiar vacíos)
    if (typeof update.category === "string") {
      update.category = (update.category as string).trim();
      if (update.category === "") delete update.category;
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
    );

    if (!doc) return res.status(404).json({ error: "Not found" });

    res.json(mapDoc(doc));
  } catch (e: any) {
    console.error("PATCH /products error:", e?.message, e?.errors || e);
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
