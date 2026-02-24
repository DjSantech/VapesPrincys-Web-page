import mongoose, { Schema, Document } from "mongoose";

export interface ISurveyResponse extends Document {
  surveyId: mongoose.Types.ObjectId;
  userName: string;
  idCard: string;     // Cédula
  phoneNumber: string;
  answers: string[];  // Respuestas en el mismo orden que las preguntas
  couponCode: string; // El código de descuento generado
  createdAt: Date;
}

const SurveyResponseSchema: Schema = new Schema({
  surveyId: { type: Schema.Types.ObjectId, ref: "Survey", required: true },
  userName: { type: String, required: true },
  idCard: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  answers: [{ type: String }],
  couponCode: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<ISurveyResponse>("SurveyResponse", SurveyResponseSchema);