// src/routes/products_routes.ts
import { Router } from "express";
import multer from "multer";
import mongoose from "mongoose";
import Product from "../models/Product";
import Category from "../models/Category";
import { uploadBufferToCloudinary } from "../lib/uploadBufferToCloudinary";
// Importamos la utilidad de limpieza desde tu config
import { deleteImageFromCloudinary } from "../lib/cloudinary";

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

// Mapear documento -> DTO para el front
  const mapDoc = (p: any) => {
  const catId = p.category ? String(p.category._id ?? p.category) : "";
  const catName = p.category?.name ?? (typeof p.category === "string" ? p.category : "");

  return {
    id: String(p._id),
    sku: p.sku ?? "",
    name: p.name,
    price: p.price,
    dropshipperPrice: p.dropshipperPrice,
    stock: p.stock ?? 0,
    puffs: p.puffs ?? 0,
    ml: p.ml ?? 0,

    // ✅ USA EL VALOR REAL
    visibleWhoSale: p.visibleWhoSale ?? false,

    wholesaleRates: p.wholesaleRates ?? { tier1: 0, tier2: 0, tier3: 0 },
    visible: p.isActive ?? true,
    imageUrl: p.imageUrl ?? "",
    category: catName,
    categoryId: catId,
    flavors: Array.isArray(p.flavors) ? p.flavors : [],
    pluses: Array.isArray(p.pluses) ? p.pluses : [],
    description: p.description ?? "",
    hasFlavors: p.hasFlavors ?? false,
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
    const doc = await Product.findById(id).populate("category", "name").lean();
    if (!doc) return res.status(404).json({ error: "Not found" });
    return res.json(mapDoc(doc));
  } catch (e) {
    console.error("GET /products/:id error:", e);
    return res.status(500).json({ error: "Error interno" });
  }
});

// =========================
/** GET /api/products  (lista, con filtros ?q= y ?category= ó ?categoryId= ) */
// =========================
r.get("/", async (req, res) => {
  try {
    const { q, category, categoryId } = req.query as { q?: string; category?: string; categoryId?: string };
    const filter: Record<string, unknown> = {};

    if (q && q.trim() !== "") {
      filter.name = { $regex: q.trim(), $options: "i" };
    }

    const catParam =
      categoryId && categoryId.trim() !== ""
        ? categoryId.trim()
        : category && category.trim() !== ""
          ? category.trim()
          : "";

    if (catParam) {
      if (isObjectId(catParam)) {
        filter.category = catParam;
      } else {
        const found = await Category.findOne({ name: catParam }).lean();
        if (!found) return res.json([]); 
        filter.category = found._id;
      }
    }

    const rows = await Product.find(filter).populate("category", "name").lean();
    res.json(rows.map(mapDoc));
  } catch (e) {
    console.error("GET /products error:", e);
    res.status(500).json({ error: "Error interno listando productos" });
  }
});

// =========================
// POST /api/products
// =========================

r.post("/", upload.single("image"), async (req, res) => {
  // Localiza este bloque en el POST
  try {
    // 1. Extraemos el SKU (y otros datos necesarios) del body
    const { sku, name } = req.body;

    if (!sku) {
      return res.status(400).json({ error: "El SKU es obligatorio para identificar la imagen." });
    }

    let imageUrl = "";

    // 2. Ahora 'sku' ya existe y podemos usarlo
    if (req.file) {
      // Limpiamos el SKU de espacios y lo pasamos a mayúsculas para que sea un ID consistente
      const customId = String(sku).trim().toUpperCase();
      
      const up = await uploadBufferToCloudinary(
        req.file.buffer, 
        "vapes/products", 
        customId
      ); 
      
      imageUrl = up.secure_url as string;
    }
  let wholesaleRatesParsed = undefined;
  
  if (req.body.wholesaleRates) {
    try {
      wholesaleRatesParsed =
        typeof req.body.wholesaleRates === "string"
          ? JSON.parse(req.body.wholesaleRates)
          : req.body.wholesaleRates;
    } catch {
      return res.status(400).json({ error: "wholesaleRates inválido" });
    }
  }

  try {
    const { sku, name, price, dropshipperPrice, stock, category, visible, visibleWhoSale, flavors, puffs, ml, description, hasFlavors } = req.body;

    if (!sku)  return res.status(400).json({ error: "El SKU es obligatorio" });
    if (!name) return res.status(400).json({ error: "El nombre es obligatorio" });

    const priceNum = Number(price);
    const dropshipperPriceNum = Number(dropshipperPrice || 0);
    const stockNum = stock != null ? Number(stock) : 0;
    const puffsNum = puffs != null ? Number(puffs) : 0;
    const mlNum = ml != null ? Number(ml) : 0;

    // flavors: array o CSV
    let flavorsArr: string[] = [];
    if (Array.isArray(flavors)) {
      flavorsArr = (flavors as string[]).map(s => String(s).trim()).filter(Boolean);
    } else if (typeof flavors === "string") {
      flavorsArr = flavors.split(",").map(s => s.trim()).filter(Boolean);
    }

    const hasFlavorsBool =
      typeof hasFlavors === "boolean"
        ? hasFlavors
        : typeof hasFlavors === "string"
          ? hasFlavors === "true"
          : (flavorsArr.length > 0);

    if (!hasFlavorsBool) flavorsArr = [];

    // pluses
    let plusesArr: string[] = [];
    try {
      if (Array.isArray((req.body as any).pluses)) {
        plusesArr = ((req.body as any).pluses as string[]).map(s => String(s).trim()).filter(Boolean);
      } else if (typeof (req.body as any).pluses === "string") {
        const parsed = JSON.parse((req.body as any).pluses as string);
        if (Array.isArray(parsed)) {
          plusesArr = parsed.map(s => String(s).trim()).filter(Boolean);
        }
      }
    } catch {
      plusesArr = [];
    }

    const catId = await resolveCategoryId(category);

    

    const visibleWhoSaleBool =
    typeof visibleWhoSale === "boolean"
      ? visibleWhoSale
      : typeof visibleWhoSale === "string"
        ? visibleWhoSale === "true"
        : false;

    

    const created = await Product.create({
      sku: String(sku).trim().toUpperCase(),
      name: String(name).trim(),
      description: typeof description === "string" ? description.trim() : "",
      price: priceNum,
      dropshipperPrice: dropshipperPriceNum,
      stock: stockNum,
      puffs: puffsNum,
      ml: mlNum,
      imageUrl,
      ...(catId === null ? {} : { category: catId }),
      isActive: visible !== undefined ? String(visible) === "true" : true,
      hasFlavors: hasFlavorsBool,
      flavors: flavorsArr,
      pluses: plusesArr,
      wholesaleRates: wholesaleRatesParsed,
      visibleWholesale: visibleWhoSaleBool,
    });

    const saved = await Product.findById(created._id).populate("category", "name").lean();
    return res.status(201).json(mapDoc(saved ?? created));
  } catch (e: any) {
    console.error("POST /products error:", e);
    if (e?.message === "CATEGORY_NOT_FOUND") return res.status(400).json({ error: "La categoría no existe" });
    if (e?.code === 11000) return res.status(409).json({ error: "SKU duplicado" });
    return res.status(500).json({ error: "Error interno creando producto" });
  }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear el producto" });
  }
});

// =========================
// PATCH /api/products/:id
// =========================
r.patch("/:id", upload.single("image"), async (req, res) => {
  try {
    const {
      visible,
      visibleWhoSale,
      flavors,
      price,
      dropshipperPrice,
      stock,
      puffs,
      ml,
      sku,
      name,
      category,
      pluses,
      description,
      hasFlavors,
      ...rest
    } = req.body as Record<string, unknown>;

    const update: Record<string, any> = { ...rest };

  
    // SKU y Nombre
    if (sku !== undefined) update.sku = String(sku).trim().toUpperCase();
    if (name !== undefined) update.name = String(name).trim();
    if (description !== undefined) update.description = String(description).trim();

    // Numéricos
    if (price !== undefined) update.price = Math.round(Number(price));
    if (dropshipperPrice !== undefined) update.dropshipperPrice = Number(dropshipperPrice);
    if (stock !== undefined) update.stock = Math.max(0, Math.round(Number(stock)));
    if (puffs !== undefined) update.puffs = Math.max(0, Math.round(Number(puffs)));
    if (ml !== undefined) update.ml = Math.max(0, Math.round(Number(ml)));

    // Imagen (si se sube una nueva, reemplaza la anterior usando el SKU como public_id)
    if (req.file) {
    // 1. Buscamos el producto actual para obtener su SKU
    const current = await Product.findById(req.params.id);
    
    if (!current) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    // 2. Subimos la nueva imagen usando el SKU como identificador.
    // Esto reemplazará la imagen anterior automáticamente en Cloudinary.
    const up = await uploadBufferToCloudinary(
      req.file.buffer, 
      "vapes/products", 
      current.sku // 👈 Usamos el SKU para sobreescribir
    );

    // 3. Actualizamos la URL en la base de datos
    // @ts-ignore
    update.imageUrl = up.secure_url;
  }
  

    // Visible
    if (visible !== undefined) update.isActive = String(visible) === "true";

    // Flavors y hasFlavors (Invariante lógica)
    let flavorsFromBody: string[] | undefined = undefined;
    if (Array.isArray(flavors)) {
      flavorsFromBody = (flavors as string[]).map(s => String(s).trim()).filter(Boolean);
    } else if (typeof flavors === "string") {
      flavorsFromBody = flavors.split(",").map(s => s.trim()).filter(Boolean);
    }

    let hfBool = typeof hasFlavors === "string" ? hasFlavors === "true" : hasFlavors;

    if (hfBool === false) {
      update.hasFlavors = false;
      update.flavors = [];
    } else {
      if (flavorsFromBody !== undefined) update.flavors = flavorsFromBody;
      if (hfBool !== undefined) update.hasFlavors = hfBool;
    }

    // Pluses
    if (Object.prototype.hasOwnProperty.call(req.body, "pluses")) {
      try {
        if (Array.isArray(pluses)) {
          update.pluses = (pluses as string[]).map(s => String(s).trim()).filter(Boolean);
        } else if (typeof pluses === "string") {
          const parsed = JSON.parse(pluses);
          update.pluses = Array.isArray(parsed) ? parsed.map(s => String(s).trim()).filter(Boolean) : [];
        }
      } catch { update.pluses = []; }
    }

    // Category
    if (Object.prototype.hasOwnProperty.call(req.body, "category")) {
      const catId = await resolveCategoryId(category);
      if (catId === null) {
        update.$unset = { ...(update.$unset as any), category: 1 };
        delete update.category;
      } else if (catId !== undefined) {
        update.category = catId;
      }
    }
    
    // -----------------------------
    // Visible wholesale
    // -----------------------------
    let visibleWhoSaleBool: boolean | undefined = undefined;

    if (Object.prototype.hasOwnProperty.call(req.body, "visibleWhoSale")) {
      if (typeof visibleWhoSale === "boolean") {
        visibleWhoSaleBool = visibleWhoSale;
      } else if (typeof visibleWhoSale === "string") {
        visibleWhoSaleBool = visibleWhoSale === "true";
      }

      if (visibleWhoSaleBool !== undefined) {
        update.visibleWhoSale = visibleWhoSaleBool;
      }
    }

    // -----------------------------
    // Wholesale rates
    // -----------------------------
    if (Object.prototype.hasOwnProperty.call(req.body, "wholesaleRates")) {
      try {
        const parsed =
          typeof req.body.wholesaleRates === "string"
            ? JSON.parse(req.body.wholesaleRates)
            : req.body.wholesaleRates;

        // 🚩 Si explícitamente se apagó el mayoreo → limpia tiers
        if (visibleWhoSaleBool === false) {
          update.wholesaleRates = { tier1: 0, tier2: 0, tier3: 0 };
        } else {
          update.wholesaleRates = {
            tier1: Number(parsed?.tier1 ?? 0),
            tier2: Number(parsed?.tier2 ?? 0),
            tier3: Number(parsed?.tier3 ?? 0),
          };
        }
      } catch (error) {
        // fallback seguro
        if (visibleWhoSaleBool === false) {
          update.wholesaleRates = { tier1: 0, tier2: 0, tier3: 0 };
        }
      }
    }


    const doc = await Product.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true, context: "query" }
    ).populate("category", "name");

    if (!doc) return res.status(404).json({ error: "Not found" });
    return res.json(mapDoc(doc));
  } catch (e: any) {
    console.error("PATCH /products error:", e);
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

    // 1. Buscamos el producto para obtener su SKU antes de borrarlo
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    // 2. Borrado de Cloudinary usando el SKU
    if (product.sku) {
      // Usamos el sku porque así nombramos el archivo al subirlo
      await deleteImageFromCloudinary(product.sku); 
    }

    // 3. Eliminar el registro de la base de datos
    await Product.findByIdAndDelete(id);

    return res.status(204).send();
  } catch (e) {
    console.error("DELETE /products/:id error:", e);
    return res.status(500).json({ error: "Error interno eliminando producto" });
  }
});
export default r;