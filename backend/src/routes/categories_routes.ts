// src/routes/categories_routes.ts
import { Router } from "express";
import mongoose from "mongoose";
import Category from "../models/Category";
import multer from "multer"; 
import { uploadBufferToCloudinary } from "../lib/uploadBufferToCloudinary"; 
// Importamos la utilidad de limpieza
import { deleteImageFromCloudinary } from "../lib/cloudinary";

// Inicialización del Router y Multer
const r = Router(); 
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // Límite de 5MB
  }
});

// Helpers de categoría
const mapCat = (c: { 
  _id: unknown; 
  name: string; 
  homeOrder?: number;
  imageUrl?: string; 
}) => ({
  id: String(c._id),
  name: c.name,
  homeOrder: typeof c.homeOrder === "number" ? c.homeOrder : undefined,
  imageUrl: c.imageUrl,
});

// =========================
// GET /api/categories
// =========================
r.get("/", async (_req, res) => {
  try {
    const rows = await Category.find({}).sort({ name: 1 }).lean();
    res.json(rows.map(mapCat));
  } catch (e) {
    console.error("GET /categories error:", e);
    res.status(500).json({ error: "Error interno listando categorías" });
  }
});

// =========================
// POST /api/categories
// =========================
r.post("/", async (req, res) => {
  try {
    const name = String(req.body?.name ?? "").trim();
    if (!name) return res.status(400).json({ error: "Nombre obligatorio" });
    const created = await Category.create({ name });
    res.status(201).json(mapCat(created));
  } catch (e: any) {
    if (e?.code === 11000) return res.status(409).json({ error: "La categoría ya existe" });
    console.error("POST /categories error:", e);
    res.status(500).json({ error: "Error interno creando categoría" });
  }
});

// =========================
// PATCH /api/categories/:id (datos básicos)
// =========================
r.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: "ID inválido" });

    const update: Partial<{ name: string; homeOrder: number }> = {};
    if (typeof req.body?.name === "string") {
      const name = req.body.name.trim();
      if (!name) return res.status(400).json({ error: "Nombre obligatorio" });
      update.name = name;
    }
    if (req.body?.homeOrder !== undefined) {
      update.homeOrder = Math.round(Number(req.body.homeOrder));
    }

    const updated = await Category.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!updated) return res.status(404).json({ error: "Not found" });
    return res.json(mapCat(updated));
  } catch (e) {
    res.status(500).json({ error: "Error actualizando categoría" });
  }
});

// =========================
// RUTA DE IMAGEN: PATCH /api/categories/:id/image
// =========================
r.patch("/:id/image", upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: "ID inválido" });

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: "No se encontró el archivo de imagen" });
    }

    // --- LÓGICA DE LIMPIEZA ---
    // 1. Buscamos la categoría actual para ver si ya tiene una imagen
    const currentCat = await Category.findById(id);
    if (currentCat?.imageUrl) {
      // 2. Si existe, la borramos de Cloudinary
      await deleteImageFromCloudinary(currentCat.imageUrl);
    }
    
    // 3. Subimos la nueva imagen
    const up = await uploadBufferToCloudinary(req.file.buffer, "vapes/categories");
    // @ts-ignore
    const finalImageUrl = up.secure_url as string; 

    // 4. Actualizamos la base de datos
    const updated = await Category.findByIdAndUpdate(
      id,
      { imageUrl: finalImageUrl }, 
      { new: true }
    ).lean();

    if (!updated) return res.status(404).json({ error: "Not found" });

    return res.json(mapCat(updated));
  } catch (e) {
    console.error("PATCH /categories/:id/image error:", e);
    res.status(500).json({ error: "Error subiendo imagen" });
  }
});


// =========================
// DELETE /api/categories/:id
// =========================
r.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: "ID inválido" });
    
    // --- LÓGICA DE LIMPIEZA ---
    const category = await Category.findById(id);
    if (category?.imageUrl) {
      // Borramos la imagen de la nube antes de borrar el registro
      await deleteImageFromCloudinary(category.imageUrl);
    }

    const doc = await Category.findByIdAndDelete(id);
    if (!doc) return res.status(404).json({ error: "Not found" });
    
    return res.status(204).send();
  } catch (e) {
    console.error("DELETE /categories/:id error:", e);
    res.status(500).json({ error: "Error eliminando categoría" });
  }
});

export default r;