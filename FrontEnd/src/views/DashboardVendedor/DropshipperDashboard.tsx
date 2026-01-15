// src/views/DropshipperDashboard.tsx
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import type { AuthUser } from "../../types";

export default function DropshipperDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);
  useEffect(() => {
    // Recuperamos los datos que guardamos en el login
    const savedData = localStorage.getItem("user_data");
    const token = localStorage.getItem("AUTH_TOKEN");

    if (!savedData || !token) {
      navigate("/auth/login");
      return;
    }
    setUser(JSON.parse(savedData));
  }, [navigate]);

  if (!user) return null;

  // Generamos el link: tuweb.com/?ref=juan-1234
  const referralLink = `${window.location.origin}/?ref=${user.referralCode}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success("¡Link copiado con éxito! 🚀");
  };

  const handleLogout = () => {
    localStorage.removeItem("AUTH_TOKEN");
    localStorage.removeItem("user_data");
    navigate("/auth/login");
  };

  return (
    <div className="min-h-screen bg-[#0f1113] text-zinc-100 p-6">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold">Panel de Vendedor</h1>
            <p className="text-zinc-400">Bienvenido, {user.nombre}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="text-sm bg-stone-800 hover:bg-stone-700 px-4 py-2 rounded-xl transition-colors"
          >
            Cerrar sesión
          </button>
        </header>

        <main className="space-y-6">
          {/* Tarjeta del Link */}
          <section className="bg-[#1a1d1f] border border-stone-800 rounded-2xl p-6 sm:p-8 shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-emerald-400">Tu Link Personalizado</h2>
            <p className="text-sm text-zinc-400 mb-6">
              Copia este link y compártelo en tus redes sociales o con tus clientes. 
              Cualquier compra hecha desde aquí te sumará comisión.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 bg-black/40 border border-stone-800 rounded-xl px-4 py-3 text-sm font-mono text-emerald-300 overflow-x-auto">
                {referralLink}
              </div>
              <button 
                onClick={copyToClipboard}
                className="bg-emerald-400 hover:bg-emerald-300 text-black font-bold px-6 py-3 rounded-xl transition-all active:scale-95"
              >
                Copiar Link
              </button>
            </div>
          </section>

          {/* Sección de Perfil */}
          <section className="bg-[#1a1d1f] border border-stone-800 rounded-2xl p-6">
            <h3 className="text-lg font-medium mb-4">Información de Perfil</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-black/20 p-4 rounded-xl border border-stone-800/50">
                <span className="text-xs text-zinc-500 block uppercase mb-1">Tu Código</span>
                <span className="text-emerald-400 font-bold">{user.referralCode}</span>
              </div>
              <div className="bg-black/20 p-4 rounded-xl border border-stone-800/50">
                <span className="text-xs text-zinc-500 block uppercase mb-1">Rol de cuenta</span>
                <span className="text-zinc-300 capitalize">{user.rol}</span>
              </div>
            </div>
          </section>

          {/* Banner Informativo */}
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 flex gap-4">
            <span className="text-2xl">💰</span>
            <p className="text-sm text-emerald-200/80 leading-relaxed">
              <strong>¿Cómo cobro mis comisiones?</strong><br />
              Cuando alguien compre con tu link, nuestro administrador revisará el pedido y se pondrá en contacto contigo directamente al celular o correo que registraste para coordinar el pago de tu comisión.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}