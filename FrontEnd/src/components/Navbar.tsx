// src/components/Navbar.tsx
import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, Home } from "lucide-react";
import CartButton from "./CartButton";

// Las categorías deben coincidir con tu backend.
// "" significa "todas".
const CATEGORIES = ["", "Desechables", "Pods", "Líquidos", "Accesorios"] as const;
type Category = (typeof CATEGORIES)[number];

// (opcional) pequeño debounce para no spammear la URL
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

  // Lee valores iniciales de la URL
  const [q, setQ] = useState<string>(params.get("q") ?? "");
  const [cat, setCat] = useState<Category>(
    (params.get("category") as Category) ?? ""
  );

  const qDebounced = useDebounce(q, 350);

  // Sincroniza URL cuando cambie q (debounced) o categoría
  useEffect(() => {
    const next = new URLSearchParams(params);
    // q
    if (qDebounced) next.set("q", qDebounced);
    else next.delete("q");
    // category
    if (cat) next.set("category", cat);
    else next.delete("category");

    setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qDebounced, cat]);

  return (
    <header className="w-full sticky top-0 z-50 bg-[#0f2b23] text-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="h-16 flex items-center gap-4">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center">
              <span className="text-sm font-bold">VP</span>
            </div>
            <span className="text-lg sm:text-xl font-semibold tracking-wide">
              Vapitos Princys
            </span>
          </Link>

          {/* Home link */}
          <Link
            to="/"
            className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5 transition"
            aria-label="Ir a inicio"
            title="Inicio"
          >
            <Home className="size-4" />
            <span className="text-sm">Home</span>
          </Link>

          {/* Search + categorías */}
          <div className="ml-auto flex-1 max-w-2xl">
            <div
              className="relative flex items-center rounded-full bg-[#0d241e] ring-1 ring-white/10 focus-within:ring-2 focus-within:ring-emerald-400 transition"
              role="search"
            >
              <Search className="absolute left-3 size-4 text-white/60 pointer-events-none" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar (nombre del vape)"
                className="w-full pl-10 pr-44 py-3 text-sm bg-transparent placeholder-white/60 text-white outline-none"
                aria-label="Buscar productos"
              />

              {/* Selector de categoría dentro del pill, a la derecha */}
              <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                <div className="flex items-center gap-2 rounded-full bg-white/5 ring-1 ring-white/10 px-3 py-1.5">
                  <label htmlFor="nav-category" className="sr-only">
                    Categoría
                  </label>
                  <select
                    id="nav-category"
                    value={cat}
                    onChange={(e) => setCat(e.target.value as Category)}
                    className="bg-transparent text-white text-sm outline-none appearance-none pr-4"
                    title="Categorías"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c || "all"} className="bg-[#0f2b23]" value={c}>
                        {c || "Todas las categorías"}
                      </option>
                    ))}
                  </select>
                  <svg
                    aria-hidden="true"
                    className="size-4 text-white/70 -ml-3"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Carrito (fuera del input para no romper el layout) */}
          <CartButton />
        </div>
      </div>
    </header>
  );
}
