import { Schema, model } from "mongoose";

const ProductSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true }, // en centavos
  imageUrl: String,
  category: { type: String, index: true }, // "Desechables", "Pods", etc.
  flavors: [String],
  stock: { type: Number, default: 0 },
  description: String,
}, { timestamps: true });

export default model("Product", ProductSchema);
