import { useEffect } from "react"; // 1. Importamos useEffect
import { Outlet, useSearchParams } from "react-router-dom"; // 2. Importamos useSearchParams
import { useCart } from "../store/cart_info"; // 3. Importamos tu store
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function MainLayout() {
  const [searchParams] = useSearchParams();
  const { setDropshipping, setSellerId } = useCart();

  useEffect(() => {
    // Buscamos el parámetro "ref" en la URL (ej: princisvapes.com/?ref=vendedor01)
    const ref = searchParams.get("ref");

    if (ref) {
      // 🚨 ¡DETECTADO! 
      // Si el link trae un código, activamos el modo dropshipping
      setDropshipping(true);
      setSellerId(ref);
      
      console.log("Sistema: Modo Dropshipping activado para:", ref);

      // Opcional: Limpiar la URL para que no se vea el ?ref= después de capturarlo
      // window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [searchParams, setDropshipping, setSellerId]);

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