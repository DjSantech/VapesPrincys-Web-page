import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginView from "./views/LoginView";
import RegisterView from "./views/RegisterView";
import AuthLayout from "./layouts/AuthLayout";
import MainLayout from "./layouts/MainLayout";
import HomeView from "./views/HomeView";
import ProductLayout from "./layouts/ProductLayout";
import ProductDetailPage from "./views/ProductDetailPage";

export default function Router () {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<AuthLayout/>}>
                <Route path="/auth/login" element={<LoginView />} />
                <Route path="/auth/register" element={<RegisterView/>} />
                </Route>
                <Route element={<MainLayout/>}>
                <Route path="/" element={<HomeView/>} />
                </Route>
                <Route element={<ProductLayout/>}>
                <Route path="/product/:id" element={<ProductDetailPage/>} />
                </Route>

                
            </Routes>
        </BrowserRouter>
    )
}