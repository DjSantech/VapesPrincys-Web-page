// src/routes/DropshipperRoute.tsx
import { Navigate } from "react-router-dom";

export default function DropshipperRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("AUTH_TOKEN");
  const userData = localStorage.getItem("user_data");
  const user = userData ? JSON.parse(userData) : null;

  if (!token || user?.rol !== "DROPSHIPPER") {
    // Si no es vendedor, lo sacamos
    return <Navigate to="/auth/login" replace />;
  }

  return <>{children}</>;
}