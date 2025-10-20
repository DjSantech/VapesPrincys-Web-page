import { Router } from "express";
import mongoose from "mongoose";
import Category from "../models/Category";

const r = Router();

const mapCat = (c: any) => ({ id: String(c._id), name: c.name });

// GET /api/categories
r.get("/", async (_req, res) => {
  try {
    const rows = await Category.find({}).sort({ name: 1 }).lean();
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
    const created = await Category.create({ name });
    res.status(201).json(mapCat(created));
  } catch (e: any) {
    if (e?.code === 11000) {
      return res.status(409).json({ error: "La categoría ya existe" });
    }
    console.error("POST /categories error:", e);
    res.status(500).json({ error: "Error interno creando categoría" });
  }
});

// DELETE /api/categories/:id
r.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }
    const doc = await Category.findByIdAndDelete(id);
    if (!doc) return res.status(404).json({ error: "Not found" });
    return res.status(204).send();
  } catch (e) {
    console.error("DELETE /categories/:id error:", e);
    res.status(500).json({ error: "Error interno eliminando categoría" });
  }
});

export default r;
