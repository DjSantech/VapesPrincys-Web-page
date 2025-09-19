import { Outlet } from "react-router-dom";
import { Toaster } from "sonner"

export default function AuthLayout() {
  return (
    <>
    <div className=" bg-[#0E281D] min-h-screen">
          <div className="max-w-lg mx-auto  pt-10 px-5">
        <img src="/public/logo_1.jpeg" alt="Logotipo de DEVTREE"></img>
            <div className="py-10">
              <Outlet/>
            </div>
          </div>
      </div>
      <Toaster position="top-right"/>
    </>
  )
}
