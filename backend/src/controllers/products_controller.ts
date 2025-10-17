import Product from "../models/Product";
import { Request, Response } from "express";

// LIST + filtros
export const listProducts = async (req: Request, res: Response) => {
  const q = (req.query.q as string)?.toLowerCase() || "";
  const category = (req.query.category as string) || "";
  const filter: any = {};
  if (q) filter.name = { $regex: q, $options: "i" };
  if (category) filter.category = category;
  const items = await Product.find(filter).sort({ createdAt: -1 });
  res.json(items);
};

// GET by id
export const getProductById = async (req: Request, res: Response) => {
  const p = await Product.findById(req.params.id);
  if (!p) return res.status(404).json({ error: "Producto no encontrado" });
  res.json(p);
};

// CREATE
export const createProduct = async (req: Request, res: Response) => {
  const p = await Product.create(req.body);
  res.status(201).json(p);
};

// UPDATE
export const updateProduct = async (req: Request, res: Response) => {
  const p = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!p) return res.status(404).json({ error: "Producto no encontrado" });
  res.json(p);
};

// DELETE
export const deleteProduct = async (req: Request, res: Response) => {
  const p = await Product.findByIdAndDelete(req.params.id);
  if (!p) return res.status(404).json({ error: "Producto no encontrado" });
  res.json({ ok: true });
};
