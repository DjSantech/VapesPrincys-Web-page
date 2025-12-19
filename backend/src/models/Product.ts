// src/models/Product.ts
import { Schema, model, InferSchemaType } from "mongoose";

const productSchema = new Schema({
  sku: { type: String, required: true, unique: true, index: true, trim: true },
  name:     { type: String, required: true, trim: true },
  brand: { type: String, default: "", trim: true },
  puffs:    { type: Number, required: true, min: 0 },
  ml:       { type: Number, required: true, min: 0 },
  price:    { type: Number, required: true, min: 0 },   // en centavos
  stock:    { type: Number, default: 0, min: 0 },
  imageUrl: { type: String, default: "" },
  category: { type: Schema.Types.ObjectId, ref: "Category", default: null },
  isActive: { type: Boolean, default: true },
  description: { type: String, default: "", trim: true },
  hasFlavors: { type: Boolean, default: false },
  // Sabores (lista de strings, sin duplicados)
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
  

  // NUEVO: Pluses (lista de nombres de plus, sin duplicados)
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

productSchema.pre("validate", function (next) {
  // @ts-ignore
  if (this.sku) this.sku = String(this.sku).trim().toUpperCase();

  // @ts-ignore
  if (Array.isArray(this.flavors)) {
    // @ts-ignore
    this.flavors = this.flavors.map((s: string) => s.trim()).filter(Boolean);
  }

  // @ts-ignore
  if (Array.isArray(this.pluses)) {
    // @ts-ignore
    this.pluses = this.pluses.map((s: string) => s.trim()).filter(Boolean);
  }

  next();
});

export type ProductDoc = InferSchemaType<typeof productSchema>;
export default model<ProductDoc>("Product", productSchema);
