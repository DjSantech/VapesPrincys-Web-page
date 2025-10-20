import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";

export default function AuthLayout() {
  return (
    <>
      <div
        className="min-h-screen bg-no-repeat bg-cover bg-center"
        style={{ backgroundImage: "url('/princys_img/FondoHome.jpg')" }}
      >
        <div className="max-w-lg mx-auto pt-10 px-5">
          <img src="/princys_img/logo.jpg" alt="Logotipo de DEVTREE" />
          <div className="py-10">
            <Outlet />
          </div>
        </div>
      </div>
      <Toaster position="top-right" />
    </>
  );
}
