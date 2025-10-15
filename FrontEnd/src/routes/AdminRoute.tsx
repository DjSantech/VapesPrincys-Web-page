// src/routes/AdminRoute.tsx
import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

export default function AdminRoute({ children }: { children: ReactNode }) {
  const isAdmin = localStorage.getItem("admin_token") === "ok";
  if (!isAdmin) return <Navigate to="/auth/login" replace />;
  return <>{children}</>;
}
