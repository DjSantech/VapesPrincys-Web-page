// src/components/Navbar.tsx
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, Home } from "lucide-react";
import CartButton from "../components/CartButton";

// "" = todas; los nombres deben coincidir con tu backend
const CATEGORIES = ["", "Desechables", "Pods", "Líquidos", "Accesorios"] as const;
type Category = (typeof CATEGORIES)[number];

// Debounce simple para no spammear la URL al escribir
function useDebounce<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export default function Navbar() {
  const [params, setParams] = useSearchParams();

  // lee estado inicial desde la URL
  const [q, setQ] = useState<string>(params.get("q") ?? "");
  const [cat, setCat] = useState<Category>(
    (params.get("category") as Category) ?? ""
  );
  const qDebounced = useDebounce(q, 350);

useEffect(() => {
  const next = new URLSearchParams(params);

  if (qDebounced) {
    next.set("q", qDebounced);
  } else {
    next.delete("q");
  }

  if (cat) {
    next.set("category", cat);
  } else {
    next.delete("category");
  }

  setParams(next, { replace: true });
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [qDebounced, cat]);

  return (
    <header className="sticky top-0 z-50 bg-[#0f2b23]/90 backdrop-blur text-white border-b border-green-700">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div className="h-16 flex items-center gap-3">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center">
              <span className="text-sm font-bold">VP</span>
            </div>
            <span className="hidden xs:inline text-lg sm:text-xl font-semibold tracking-wide">
              Vapitos Princys
            </span>
          </Link>

          {/* Home (solo md+) */}
          <Link
            to="/"
            className="hidden md:inline-flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5 transition"
            aria-label="Ir a inicio"
            title="Inicio"
          >
            <Home className="size-4" />
            <span className="text-sm">Home</span>
          </Link>

          {/* Search pill */}
          <div className="ml-auto flex-1 min-w-0 max-w-2xl">
            <div
              className="relative flex items-center rounded-full bg-[#0d241e] ring-1 ring-white/10 focus-within:ring-2 focus-within:ring-emerald-400 transition"
              role="search"
            >
              <Search className="absolute left-3 size-4 text-white/60 pointer-events-none" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar (nombre del vape)"
                className="w-full pl-10 pr-40 sm:pr-44 py-2.5 sm:py-3 text-sm bg-transparent placeholder-white/60 text-white outline-none"
                aria-label="Buscar productos"
              />

              {/* Selector de categoría encajado a la derecha del pill */}
              <div className="absolute inset-y-0 right-10 sm:right-12 flex items-center pr-1.5">
                <label htmlFor="nav-category" className="sr-only">
                  Categoría
                </label>
                <select
                  id="nav-category"
                  value={cat}
                  onChange={(e) => setCat(e.target.value as Category)}
                  className="bg-white/5 ring-1 ring-white/10 rounded-full px-2.5 py-1.5 text-xs sm:text-sm text-white outline-none"
                  title="Categorías"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c || "all"} className="bg-[#0f2b23]" value={c}>
                      {c || "Todas"}
                    </option>
                  ))}
                </select>
              </div>

              {/* Carrito pegado al borde derecho */}
              <div className="absolute right-1 sm:right-2">
                <CartButton />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fila extra en móviles pequeños (opcional):
          si prefieres el selector de categoría debajo del input en pantallas muy chicas,
          descomenta esto y quita el select embebido arriba. 
      
      <div className="sm:hidden px-4 py-2 border-t border-white/10">
        <div className="mx-auto w-full max-w-7xl">
          <select
            value={cat}
            onChange={(e) => setCat(e.target.value as Category)}
            className="w-full rounded-xl bg-white/10 border border-white/20 px-3 py-2 text-sm"
            title="Categorías"
          >
            {CATEGORIES.map((c) => (
              <option key={c || 'all'} value={c}>{c || 'Todas las categorías'}</option>
            ))}
          </select>
        </div>
      </div>
      */}
    </header>
  );
}
