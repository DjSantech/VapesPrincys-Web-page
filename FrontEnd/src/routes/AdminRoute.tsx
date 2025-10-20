// src/routes/AdminRoute.tsx
import { Navigate, useLocation } from "react-router-dom";
import type { PropsWithChildren } from "react";

const getToken = (): string | null => localStorage.getItem("admin_token");

export default function AdminRoute({ children }: PropsWithChildren) {
  const token = getToken();
  const location = useLocation();

  if (!token) {
    // Redirige al login y guarda a dónde quería ir
    return <Navigate to="/auth/login" replace state={{ from: location }} />;
  }

  // Si quieres validar rol, aquí podrías decodificar el token y chequear "role === admin"
  return <>{children}</>;
}
