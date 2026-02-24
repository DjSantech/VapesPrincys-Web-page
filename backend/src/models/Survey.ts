import mongoose, { Schema, Document } from "mongoose";

export interface ISurvey extends Document {
  title: string;
  questions: string[]; // Ejemplo: ["¿Qué sabor te gusta más?", "¿Cada cuánto compras?"]
  isActive: boolean;
  createdAt: Date;
}

const SurveySchema: Schema = new Schema({
  title: { type: String, required: true },
  questions: [{ type: String, required: true }],
  isActive: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<ISurvey>("Survey", SurveySchema);