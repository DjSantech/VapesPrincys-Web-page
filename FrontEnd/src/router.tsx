// src/Router.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

import AuthLayout from "./layouts/AuthLayout";
import MainLayout from "./layouts/MainLayout";
import ProductLayout from "./layouts/ProductLayout";

import LoginView from "./views/LoginView";
import RegisterView from "./views/RegisterView";
import HomeView from "./views/HomeView";
import ProductDetailPage from "./views/ProductDetailPage";
import AdminDashboard from "./views/AdminDashboard/AdminDashborad";

import AdminRoute from "./routes/AdminRoute";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas de autenticación */}
        <Route element={<AuthLayout />}>
          <Route path="/auth/login" element={<LoginView />} />
          <Route path="/auth/register" element={<RegisterView />} />
        </Route>

        {/* Home bajo MainLayout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomeView />} />
        </Route>

        {/* Detalle de producto bajo ProductLayout */}
        <Route element={<ProductLayout />}>
          <Route path="/product/:id" element={<ProductDetailPage />} />
        </Route>

        {/* Admin protegido por AdminRoute y con MainLayout (si quieres mantener el mismo layout) */}
        <Route element={<MainLayout />}>
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
        </Route>

        {/* (Opcional) 404 */}
        {/* <Route path="*" element={<NotFoundView />} /> */}
      </Routes>
    </BrowserRouter>
  );
}
