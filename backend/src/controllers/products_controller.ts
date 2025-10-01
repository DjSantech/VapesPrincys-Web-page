import { Request, Response } from "express";
import { PRODUCTS } from "../data/products_data";

export const listProducts = (req: Request, res: Response) => {
  const { q = "", page = "1", limit = "12" } = req.query as Record<string, string>;
  const p = Math.max(1, parseInt(page));
  const l = Math.max(1, parseInt(limit));

  const filtered = PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(String(q).toLowerCase())
  );

  const start = (p - 1) * l;
  const items = filtered.slice(start, start + l);

  return res.json({ items, total: filtered.length, page: p, limit: l });
};

export const getProductById = (req: Request, res: Response) => {
  const { id } = req.params;
  const product = PRODUCTS.find(p => p.id === id);
  if (!product) return res.status(404).json({ error: "Producto no encontrado" });
  return res.json(product);
};
