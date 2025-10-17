// src/models/Product.ts
import { Schema, model, InferSchemaType } from "mongoose";

const productSchema = new Schema({
  sku:      { type: String, required: true, unique: true, trim: true },
  name:     { type: String, required: true, trim: true },
  price:    { type: Number, required: true, min: 0 },   // en centavos
  stock:    { type: Number, default: 0, min: 0 },
  imageUrl: { type: String, default: "" },
  category: { type: Schema.Types.ObjectId, ref: "Category" },
  isActive: { type: Boolean, default: true },

  // NUEVO: solo lista de sabores
  flavors: {
    type: [String],
    default: [],
    validate: {
      // evita duplicados: "Uva", "uva" (puedes cambiar a case-sensitive si prefieres)
      validator(arr: string[]) {
        const norm = arr.map(s => s.trim().toLowerCase());
        return new Set(norm).size === norm.length;
      },
      message: "Los sabores no pueden repetirse"
    }
  }
}, { timestamps: true });

productSchema.pre("validate", function(next) {
  // @ts-ignore
  if (this.sku) this.sku = String(this.sku).trim().toUpperCase();
  // @ts-ignore
  if (Array.isArray(this.flavors)) {
    // normaliza espacios y elimina vacíos
    // @ts-ignore
    this.flavors = this.flavors
      .map((s: string) => s.trim())
      .filter(Boolean);
  }
  next();
});

export type ProductDoc = InferSchemaType<typeof productSchema>;
export default model<ProductDoc>("Product", productSchema);
