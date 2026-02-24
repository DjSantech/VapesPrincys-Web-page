import { Router } from "express";
import Survey from "../models/Survey";
import SurveyResponse from "../models/SurveyResponse";

const r = Router();

// --- RUTAS PARA EL ADMIN ---

// Obtener todas las encuestas
r.get("/admin", async (req, res) => {
  const surveys = await Survey.find().sort({ createdAt: -1 });
  res.json(surveys);
});

// Crear nueva encuesta
r.post("/", async (req, res) => {
  const { title, questions } = req.body;
  const newSurvey = await Survey.create({ title, questions });
  res.status(201).json(newSurvey);
});

// Activar/Desactivar encuesta
r.patch("/:id/status", async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;
  
  if (isActive) {
    // Si activamos una, desactivamos todas las demás para que solo haya una en el Home
    await Survey.updateMany({ _id: { $ne: id } }, { isActive: false });
  }
  
  const updated = await Survey.findByIdAndUpdate(id, { isActive }, { new: true });
  res.json(updated);
});

// Ver todas las respuestas (para el botón de "Resultados")
r.get("/responses", async (req, res) => {
  const responses = await SurveyResponse.find().populate("surveyId", "title");
  res.json(responses);
});

// --- RUTA PARA EL CLIENTE (HOME) ---

// Obtener la encuesta activa para el Home
r.get("/active", async (req, res) => {
  const activeSurvey = await Survey.findOne({ isActive: true });
  res.json(activeSurvey);
});

// Enviar respuesta y generar cupón
r.post("/submit", async (req, res) => {
  const { surveyId, userName, idCard, phoneNumber, answers } = req.body;
  
  // Lógica simple para generar código: VAPE-CEDULA-RANDOM
  const randomSuffix = Math.random().toString(36).substring(7).toUpperCase();
  const couponCode = `PROMO-${idCard.slice(-4)}-${randomSuffix}`;

  const response = await SurveyResponse.create({
    surveyId, userName, idCard, phoneNumber, answers, couponCode
  });

  res.status(201).json({ 
    message: "Encuesta enviada", 
    couponCode: response.couponCode 
  });
  
});

// src/routes/survey_routes.ts

r.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    // Opcional: También podrías eliminar todas las SurveyResponse asociadas a esta encuesta
    // await SurveyResponse.deleteMany({ surveyId: id });

    const deleted = await Survey.findByIdAndDelete(id);
    
    if (!deleted) return res.status(404).json({ error: "Encuesta no encontrada" });
    
    res.json({ message: "Encuesta eliminada correctamente" });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar la encuesta" });
  }
});
export default r;