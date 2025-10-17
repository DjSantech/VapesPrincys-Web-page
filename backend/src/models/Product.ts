// src/models/Product.ts
import { Schema, model } from "mongoose";

const productSchema = new Schema({
  sku:      { type: String, required: true, unique: true, index: true },
  name:     { type: String, required: true, trim: true },
  price:    { type: Number, required: true, min: 0 },
  stock:    { type: Number, default: 0, min: 0 },
  category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default model("Product", productSchema);
