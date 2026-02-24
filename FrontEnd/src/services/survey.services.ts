// src/services/survey.service.ts
import type { 
  ISurvey, 
  ISurveyResponse, 
  SurveySubmitPayload, 
  SurveySubmitResponse 
} from "../types/survey";
const API_BASE = (import.meta.env.VITE_API_URL as string) ?? "http://localhost:8080/api";

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("admin_token") ?? ""}`,
});

// --- SERVICIOS PARA EL ADMIN ---

export async function getAdminSurveys(): Promise<ISurvey[]> {
  const res = await fetch(`${API_BASE}/surveys/admin`, {
    headers: { ...authHeader() },
  });
  if (!res.ok) throw new Error("Error al obtener encuestas");
  return res.json();
}

export async function createSurvey(data: { title: string; questions: string[] }): Promise<ISurvey> {
  const res = await fetch(`${API_BASE}/surveys`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      ...authHeader() 
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al crear encuesta");
  return res.json();
}

export async function toggleSurveyStatus(id: string, isActive: boolean): Promise<ISurvey> {
  const res = await fetch(`${API_BASE}/surveys/${id}/status`, {
    method: "PATCH",
    headers: { 
      "Content-Type": "application/json",
      ...authHeader() 
    },
    body: JSON.stringify({ isActive }),
  });
  if (!res.ok) throw new Error("Error al cambiar estado");
  return res.json();
}

export async function getSurveyResponses(): Promise<ISurveyResponse[]> {
  const res = await fetch(`${API_BASE}/surveys/responses`, {
    headers: { ...authHeader() },
  });
  if (!res.ok) throw new Error("Error al obtener respuestas");
  return res.json();
}

// --- SERVICIOS PARA EL HOME ---

export async function getActiveSurvey(): Promise<ISurvey | null> {
  const res = await fetch(`${API_BASE}/surveys/active`);
  if (!res.ok) return null;
  return res.json();
}



/**
 * Envía la respuesta del cliente y recibe el código de cupón
 */
export async function submitSurveyResponse(
  data: SurveySubmitPayload
): Promise<SurveySubmitResponse> {
  const res = await fetch(`${API_BASE}/surveys/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Error al enviar encuesta");
  }

  return res.json();
}