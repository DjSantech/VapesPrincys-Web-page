import { Schema, model, InferSchemaType } from "mongoose";

const productSchema = new Schema({
  sku: { type: String, required: true, unique: true, index: true, trim: true },
  name:      { type: String, required: true, trim: true },
  brand: { type: String, default: "", trim: true },
  puffs:    { type: Number, required: true, min: 0 },
  ml:       { type: Number, required: true, min: 0 },
  price:    { type: Number, required: true, min: 0 },
  dropshippingPrice: { type: Number, required: true, default: 9999 },
  stock:    { type: Number, default: 0, min: 0 },
  imageUrl: { type: String, default: "" },
  category: { type: Schema.Types.ObjectId, ref: "Category", default: null },
  isActive: { type: Boolean, default: true },
  description: { type: String, default: "", trim: true },
  hasFlavors: { type: Boolean, default: false },
  visible: {
  type: Boolean,
  default: true,
  },

  visibleWhoSale: {
    type: Boolean,
    default: false,
  },

  
  // 🚩 NUEVA PROPIEDAD: Precios de mayoreo por niveles
  wholesaleRates: {
    tier1: { type: Number, default: 0, min: 0 }, // 10 a 30 unidades
    tier2: { type: Number, default: 0, min: 0 }, // 31 a 50 unidades
    tier3: { type: Number, default: 0, min: 0 }  // 51 a 80 unidades
  },

  flavors: {
    type: [String],
    default: [],
    validate: {
      validator(arr: string[]) {
        const norm = arr.map(s => s.trim().toLowerCase());
        return new Set(norm).size === norm.length;
      },
      message: "Los sabores no pueden repetirse"
    }
  },

  pluses: {
    type: [String],
    default: [],
    validate: {
      validator(arr: string[]) {
        const norm = arr.map(s => s.trim().toLowerCase());
        return new Set(norm).size === norm.length;
      },
      message: "Los pluses no pueden repetirse"
    }
  }
}, { timestamps: true });

// Middleware para formatear datos antes de validar
productSchema.pre("validate", function (next) {
  if (this.sku) this.sku = String(this.sku).trim().toUpperCase();

  if (Array.isArray(this.flavors)) {
    this.flavors = this.flavors.map((s: string) => s.trim()).filter(Boolean);
  }

  if (Array.isArray(this.pluses)) {
    this.pluses = this.pluses.map((s: string) => s.trim()).filter(Boolean);
  }

  next();
});

export type ProductDoc = InferSchemaType<typeof productSchema>;
export default model<ProductDoc>("Product", productSchema);