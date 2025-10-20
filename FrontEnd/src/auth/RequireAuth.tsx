// src/auth/RequireAuth.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";

const getToken = (): string | null => localStorage.getItem("admin_token");

export default function RequireAuth() {
  const token = getToken();
  const location = useLocation();

  if (!token) {
    // Redirige a /login y recuerda a dónde quería ir el usuario
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />; // deja pasar
}
