import { Instagram, Facebook, MessageCircle, Mail, MapPin, Clock } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0f1113] text-zinc-300">
      {/* TOP */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Marca */}
          <div className="space-y-3 text-center sm:text-left">
            <img
              src="/princys_img/logo.jpg"
              alt="Logo Vapitos Princys"
              className="h-10 w-auto mx-auto sm:mx-0 rounded-md"
              loading="lazy"
            />
            <p className="text-sm text-zinc-400">Vapes, sabores y accesorios al instante.</p>
            <div className="flex items-center justify-center sm:justify-start gap-3 pt-1">
              <a
                href="https://wa.me/573043602980"
                target="_blank"
                rel="noreferrer"
                aria-label="Escríbenos por WhatsApp"
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600/20 px-3 py-2 text-emerald-300 hover:bg-emerald-600/30"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
            </div>
          </div>

          {/* Navegación */}
          <div className="text-center sm:text-left">
            <h4 className="text-sm font-semibold text-zinc-200">Navegación</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link to="/admin" className="hover:text-amber-300">Admin</Link></li>
              <li><Link to="/" className="hover:text-amber-300">Productos</Link></li>
              <li><Link to="/" className="hover:text-amber-300">Promociones</Link></li>
              <li><Link to="/" className="hover:text-amber-300">Envíos</Link></li>
              <li><Link to="/" className="hover:text-amber-300">Soporte</Link></li>
            </ul>
          </div>

          {/* Contacto */}
          <div className="text-center sm:text-left">
            <h4 className="text-sm font-semibold text-zinc-200">Contacto</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex items-center justify-center sm:justify-start gap-2 break-all">
                <Mail className="h-4 w-4" />
                <a href="mailto:vapitos@princys.com" className="hover:text-amber-300">sebastianpalacios876@gmail.com</a>
                
              </li>
              <li className="flex items-center justify-center sm:justify-start gap-2">
                <MapPin className="h-8 w-8" />
                DOSQUEBRADAS 
                Cra26a #58-12 barrio el 
                ensueño Dosquebradas Risaralda
              </li>
              <li className="flex items-center justify-center sm:justify-start gap-2">
                <Clock className="h-4 w-4" />
                24 HORAS
              </li>
            </ul>
            <div className="mt-4 flex items-center justify-center sm:justify-start gap-3">
              <a
                href="https://www.instagram.com/elprincipedelosvapos"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="rounded-lg bg-white/5 p-2 hover:bg-white/10"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://www.facebook.com/people/Vapitos-Princys/61559528564141"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="rounded-lg bg-white/5 p-2 hover:bg-white/10"
              >
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Pago/Envíos */}
          <div className="text-center sm:text-left">
            <h4 className="text-sm font-semibold text-zinc-200">Pagos & Envíos</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li>✔ Transferencia, efectivo (local)</li>
              <li>✔ Transferencia (Nacional)</li>
              <li>✔ Envíos: Dosquebradas, Pereira, Cuba y Nacional</li>
              <li>✉ Entrega: mismo día (local) / 1–3 días (nacional)</li>
            </ul>
            <p className="mt-4 text-xs text-zinc-500">
              Hecho por{" "}
              <a
                className="underline hover:text-amber-300"
                href="https://github.com/DjSantech"
                target="_blank"
                rel="noreferrer"
              >
                DjSantechDev
              </a>. © {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-center sm:text-left text-xs text-zinc-500">
            © {new Date().getFullYear()} Vapitos Princys. Todos los derechos reservados.
          </p>
          <div className="flex items-center justify-center gap-3 text-xs">
            <Link to="/terminos" className="hover:text-amber-300">Términos</Link>
            <span className="text-zinc-600">·</span>
            <Link to="/privacidad" className="hover:text-amber-300">Privacidad</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
