// src/routes/products.ts
import { Router } from "express";
import Product from "../models/Product";
const r = Router();

// listar (con filtro opcional por categoría y populate)
r.get("/", async (req, res) => {
  const { category } = req.query;
  const q: any = {};
  if (category) q.category = category;
  const items = await Product.find(q).populate("category", "name slug").lean();
  res.json(items);
});

// crear
r.post("/", async (req, res) => {
  const created = await Product.create(req.body);
  res.status(201).json(created);
});

// actualizar
r.patch("/:id", async (req, res) => {
  const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

// borrar
r.delete("/:id", async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.sendStatus(204);
});

export default r;
