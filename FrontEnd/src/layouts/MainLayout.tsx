import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#55514e]"
    style={{ backgroundImage: "url('/princys_img/FondoHome.jpg')" }}>
      <Navbar />
      <main className="flex-1 pb-16" >
        <Outlet />
      </main >
      <Footer/>
    </div>
  );
}
