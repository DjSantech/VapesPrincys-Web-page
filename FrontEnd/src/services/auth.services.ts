// src/services/auth_service.ts

import type { DropshipperRegisterForm, LoginCredentials } from "../types";

// Intentamos obtener la URL de las variables de entorno, si no, usamos localhost
const API_URL = (import.meta.env.VITE_API_URL as string) || "http://localhost:8080/api";

export const registerDropshipper = async (data: DropshipperRegisterForm) => {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Error en el registro");
    }

    return result;
  } catch (error) {
    console.error("Auth Service Error:", error);
    throw error;
  }
};

export const loginUser = async (credentials: LoginCredentials) => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
  
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Error al iniciar sesión");
  }

  return result; // Devuelve { user: { rol, nombre, referralCode... }, token }
};