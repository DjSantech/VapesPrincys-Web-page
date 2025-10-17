// src/routes/products_routes.ts
import { Router } from "express";
import multer from "multer";
import mongoose from "mongoose";
import Product from "../models/Product";
// en products_routes.ts, arriba

const r = Router();
// products_routes.ts

const upload = multer({ storage: multer.memoryStorage() });

// src/routes/products_routes.ts (fragmento GET)
r.get("/", async (_req, res) => {
  const rows = await Product.find().lean();
  const data = rows.map(p => ({
    id: String(p._id),
    sku: p.sku,
    name: p.name,
    price: p.price,
    stock: p.stock ?? 0,
    visible: p.isActive ?? true,
    imageUrl: p.imageUrl ?? "",
    category: p.category ? String(p.category) : "",
    flavors: Array.isArray(p.flavors) ? p.flavors : []
  }));
  res.json(data);
});


// util
const isValidObjectId = (v: unknown) =>
  typeof v === "string" && mongoose.Types.ObjectId.isValid(v);

// CREATE (multipart/form-data)
// POST /api/products
r.post("/", upload.single("image"), async (req, res) => {
  try {
    const { sku, name, price, stock, category, visible, flavors } = req.body;

    if (!sku)  return res.status(400).json({ error: "El SKU es obligatorio" });
    if (!name) return res.status(400).json({ error: "El nombre es obligatorio" });

    const priceNum = Number(price);
    if (!Number.isFinite(priceNum) || priceNum < 0)
      return res.status(400).json({ error: "Precio inválido" });

    const stockNum = stock != null ? Number(stock) : 0;
    if (!Number.isFinite(stockNum) || stockNum < 0)
      return res.status(400).json({ error: "Stock inválido" });

    // Imagen (opcional)
    let imageUrl = "";
    if (req.file) {
      // TODO: subir a tu storage (Cloudinary/S3) y setear imageUrl
    }

    // flavors: array o CSV
    let flavorsArr: string[] = [];
    if (Array.isArray(flavors)) {
      flavorsArr = (flavors as string[]).map(s => String(s));
    } else if (typeof flavors === "string" && flavors.trim() !== "") {
      flavorsArr = flavors.split(",").map(s => s.trim()).filter(Boolean);
    }

    // category: ObjectId válido o undefined
    const categoryVal =
      typeof category === "string" && mongoose.Types.ObjectId.isValid(category)
        ? category
        : undefined;

    const created = await Product.create({
      sku: String(sku).trim().toUpperCase(),
      name: String(name).trim(),
      price: priceNum,
      stock: stockNum,
      imageUrl,
      category: categoryVal,
      isActive: visible !== undefined ? String(visible) === "true" : true,
      flavors: flavorsArr
    });

    return res.status(201).json({
      id: String(created._id),
      sku: created.sku,
      name: created.name,
      price: created.price,
      stock: created.stock ?? 0,
      visible: created.isActive ?? true,
      imageUrl: created.imageUrl ?? "",
      category: created.category ? String(created.category) : "",
      flavors: created.flavors ?? []
    });
  } catch (e: any) {
    console.error("POST /products error:", e?.message, e?.errors || e);
    if (e?.code === 11000 && e?.keyPattern?.sku) {
      return res.status(409).json({ error: "SKU duplicado" });
    }
    if (e?.name === "ValidationError")
      return res.status(400).json({ error: e.message });
    return res.status(500).json({ error: "Error interno creando producto" });
  }
});

r.patch("/:id", async (req, res) => {
  const { visible, flavors, ...rest } = req.body;
  const update: any = { ...rest };

  if (typeof visible === "boolean") update.isActive = visible;

  if (Array.isArray(flavors)) {
    update.flavors = flavors.map((s: any) => String(s).trim()).filter(Boolean);
  } else if (typeof flavors === "string") {
    update.flavors = flavors.split(",").map(s => s.trim()).filter(Boolean);
  }

  const doc = await Product.findByIdAndUpdate(
    req.params.id,
    update,
    { new: true, runValidators: true }
  ).lean();

  if (!doc) return res.status(404).json({ error: "Not found" });

  res.json({
    id: String(doc._id),
    sku: doc.sku,
    name: doc.name,
    price: doc.price,
    stock: doc.stock ?? 0,
    visible: doc.isActive ?? true,
    imageUrl: doc.imageUrl ?? "",
    category: doc.category ? String(doc.category) : "",
    flavors: Array.isArray(doc.flavors) ? doc.flavors : []
  });
});


export default r;
