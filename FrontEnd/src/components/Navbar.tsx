// src/components/Navbar.tsx
import { useState } from "react";
import { Search, Home } from "lucide-react";
import CartButton from "../components/CartButton";


type Props = {
  onSearch?: (q: string, category: string) => void;
  categories?: string[];
};

export default function Navbar({
  onSearch,
  categories = ["Todas las categorías", "Desechables", "Pods", "Líquidos", "Accesorios"],
}: Props) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState(categories[0]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(q.trim(), cat);
  };

  return (
    <header className="w-full sticky top-0 z-50 bg-[#0f2b23] text-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="h-16 flex items-center gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center">
              <span className="text-sm font-bold">VP</span>
            </div>
            <span className="text-lg sm:text-xl font-semibold tracking-wide">
              Vapitos Princys
            </span>
          </div>

          {/* Home */}
          <a
            href="/"
            className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5 transition"
            aria-label="Ir a inicio"
            title="Inicio"
          >
            <Home className="size-4" />
            <span className="text-sm">Home</span>
          </a>

          {/* Search */}
          <form onSubmit={submit} className="ml-auto flex-1 max-w-2xl">
            <div
              className="relative flex items-center rounded-full bg-[#0d241e] ring-1 ring-white/10 focus-within:ring-2 focus-within:ring-emerald-400 transition"
              role="search"
            >
              <Search className="absolute left-3 size-4 text-white/60 pointer-events-none" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar (nombre)"
                className="w-full pl-10 pr-44 py-3 text-sm bg-transparent placeholder-white/50 text-white outline-none"
                aria-label="Buscar productos"
              />

              {/* Category selector aligned to the right inside the pill */}
              <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                <div className="flex items-center gap-2 rounded-full bg-white/5 ring-1 ring-white/10 px-3 py-1.5">
                  <label htmlFor="nav-category" className="sr-only">
                    Categoría
                  </label>
                  <select
                    id="nav-category"
                    value={cat}
                    onChange={(e) => setCat(e.target.value)}
                    className="bg-transparent text-white text-sm outline-none appearance-none pr-4"
                  >
                    {categories.map((c) => (
                      <option key={c} className="bg-[#0f2b23]" value={c}>
                        {c}
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
              <CartButton />
            </div>
          </form>
        </div>
      </div>
    </header>
  );
}
