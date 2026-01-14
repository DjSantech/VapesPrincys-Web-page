import { Schema, model } from "mongoose";

const dropshipperSchema = new Schema({
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  cedula: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  celular: { type: String, required: true },
  fechaNacimiento: { type: Date, required: true },
  direccion: { type: String, required: true },
  password: { type: String, required: true },
  // El código que usará en su link: princisvapes.com/?ref=nombre-123
  referralCode: { type: String, unique: true },
  role: { type: String, default: "DROPSHIPPER" },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export const Dropshipper = model("Dropshipper", dropshipperSchema);