// src/routes/categories_routes.ts
import { Router } from "express";
import mongoose from "mongoose";
import Category from "../models/Category";

const r = Router();
const mapCat = (c: any) => ({ id: String(c._id), name: c.name, homeOrder: c.homeOrder ?? 1000 });

// GET /api/categories
r.get("/", async (_req, res) => {
  try {
    const rows = await Category.find({}).sort({ homeOrder: 1, name: 1 }).lean();
    res.json(rows.map(mapCat));
  } catch (e) {
    console.error("GET /categories error:", e);
    res.status(500).json({ error: "Error interno listando categorías" });
  }
});

// POST /api/categories {name}
r.post("/", async (req, res) => {
  try {
    const name = String(req.body?.name ?? "").trim();
    if (!name) return res.status(400).json({ error: "Nombre obligatorio" });

    const max = await Category.findOne({}).sort({ homeOrder: -1 }).lean();
    const nextOrder = (max?.homeOrder ?? 999) + 1;

    const created = await Category.create({ name, homeOrder: nextOrder });
    res.status(201).json(mapCat(created));
  } catch (e: any) {
    if (e?.code === 11000) return res.status(409).json({ error: "La categoría ya existe" });
    console.error("POST /categories error:", e);
    res.status(500).json({ error: "Error interno creando categoría" });
  }
});

// PATCH /api/categories/:id {homeOrder?: number, name?: string}
r.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: "ID inválido" });

    const patch: any = {};
    if (typeof req.body?.homeOrder === "number") patch.homeOrder = req.body.homeOrder;
    if (typeof req.body?.name === "string")     patch.name = String(req.body.name).trim();

    const doc = await Category.findByIdAndUpdate(id, patch, { new: true, runValidators: true }).lean();
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json(mapCat(doc));
  } catch (e) {
    console.error("PATCH /categories/:id error:", e);
    res.status(500).json({ error: "Error interno actualizando categoría" });
  }
});

// DELETE igual que ya tenías
export default r;
