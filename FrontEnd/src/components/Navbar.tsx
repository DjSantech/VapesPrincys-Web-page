// src/components/Navbar.tsx
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, Home } from "lucide-react";
import CartButton from "../components/CartButton";

// "" = todas; los nombres deben coincidir con tu backend
const CATEGORIES = ["", "Desechables", "Pods", "Líquidos", "Accesorios"] as const;
type Category = (typeof CATEGORIES)[number];

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

  const [q, setQ] = useState<string>(params.get("q") ?? "");
  const [cat, setCat] = useState<Category>((params.get("category") as Category) ?? "");
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
    <header className="sticky top-0 z-50 bg-[#1a1d1f]/95 backdrop-blur border-b border-stone-800 text-zinc-100">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div className="h-16 flex items-center gap-3">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="h-9 w-9 rounded-xl bg-[#2a2a28] border border-stone-700 flex items-center justify-center">
              <span className="text-sm font-bold text-zinc-200">VP</span>
            </div>
            <span className="hidden xs:inline text-lg sm:text-xl font-semibold tracking-wide text-zinc-100">
              Vapitos Princys
            </span>
          </Link>

          {/* Home (md+) */}
          <Link
            to="/"
            className="hidden md:inline-flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#181b1d] border border-transparent hover:border-stone-800 transition-colors"
            aria-label="Ir a inicio"
            title="Inicio"
          >
            <Home className="size-4 text-zinc-300" />
            <span className="text-sm text-zinc-300">Home</span>
          </Link>

          {/* Search pill */}
          <div className="ml-auto flex-1 min-w-0 max-w-2xl">
            <div
              className="relative flex items-center rounded-full bg-[#0f1113] ring-1 ring-stone-800 focus-within:ring-2 focus-within:ring-stone-600 transition"
              role="search"
            >
              <Search className="absolute left-3 size-4 text-zinc-400 pointer-events-none" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar (nombre del vape)"
                className="w-full pl-10 pr-40 sm:pr-44 py-2.5 sm:py-3 text-sm bg-transparent placeholder:text-zinc-500 text-zinc-100 outline-none"
                aria-label="Buscar productos"
              />

              {/* Selector de categoría encajado a la derecha */}
              <div className="absolute inset-y-0 right-10 sm:right-12 flex items-center pr-1.5">
                <label htmlFor="nav-category" className="sr-only">
                  Categoría
                </label>
                <select
                  id="nav-category"
                  value={cat}
                  onChange={(e) => setCat(e.target.value as Category)}
                  className="bg-[#1f2123] text-zinc-200 ring-1 ring-stone-800 rounded-full px-2.5 py-1.5 text-xs sm:text-sm outline-none hover:ring-stone-700"
                  title="Categorías"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c || "all"} className="bg-[#0f1113] text-zinc-100" value={c}>
                      {c || "Todas"}
                    </option>
                  ))}
                </select>
              </div>

              {/* Carrito */}
              <div className="absolute right-1 sm:right-2">
                <CartButton />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Si quieres conservar una variante móvil extra del selector, 
          guárdala en otro componente o usa {false && (<div>...</div>)} para
          evitar el warning de “unused expressions”. */}
    </header>
  );
}
