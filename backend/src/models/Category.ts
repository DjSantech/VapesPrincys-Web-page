// src/models/Category.ts
import { Schema, model } from "mongoose";

const CategorySchema = new Schema({
  name: { type: String, required: true, unique: true, trim: true },
  homeOrder: { type: Number, default: 1000 },
  imageUrl: { type: String, required: false }, 
}, { timestamps: true });

export default model("Category", CategorySchema);