// src/controllers/products_controller.ts
import { Request, Response } from "express";
import { PRODUCTS } from "../data/products_data"; // o tu fuente real de datos

export const listProducts = (req: Request, res: Response) => {
  const q = (req.query.q as string)?.toLowerCase() || "";
  const category = (req.query.category as string)?.trim().toLowerCase() || "";

  let result = PRODUCTS;

  if (q) {
    result = result.filter(p => p.name.toLowerCase().includes(q));
  }
  if (category) {
    result = result.filter(p => p.category.toLowerCase() === category);
  }

  res.json(result);
};

export const getProductById = (req: Request, res: Response) => {
  const product = PRODUCTS.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }
  res.json(product);
};
