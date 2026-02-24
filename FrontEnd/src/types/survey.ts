// src/types/survey.ts o src/services/survey.types.ts

export interface ISurvey {
  _id: string;        // ID de MongoDB
  id?: string;        // Opcional, por si haces un map en el backend como con las categorías
  title: string;
  questions: string[];
  isActive: boolean;
  createdAt: string | Date;
}

export interface ISurveyResponse {
  _id: string;
  surveyId: string | { _id: string; title: string }; // Puede venir poblado o solo el ID
  userName: string;
  idCard: string;
  phoneNumber: string;
  answers: string[];
  couponCode: string;
  createdAt: string | Date;
}

// Para cuando creas una nueva encuesta
export interface CreateSurveyPayload {
  title: string;
  questions: string[];
}

export interface SurveySubmitPayload {
  surveyId: string;
  userName: string;
  idCard: string;     // Cédula
  phoneNumber: string;
  answers: string[];  // Array con las respuestas elegidas o escritas
}

// También definamos la respuesta del servidor tras el envío
export interface SurveySubmitResponse {
  message: string;
  couponCode: string;
}