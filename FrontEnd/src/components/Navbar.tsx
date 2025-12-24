import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, Home, TrendingUp } from "lucide-react";
import CartButton from "../components/CartButton";

type CategoryDTO = { id: string; name: string };

function useDebounce<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export default function Navbar() {
  const [params, setParams] = useSearchParams();

  // Estado de búsqueda
  const [q, setQ] = useState<string>(params.get("q") ?? "");
  const qDebounced = useDebounce(q, 350);

  // Estados de categorías
  const [cats, setCats] = useState<CategoryDTO[]>([]);
  const [catsLoading, setCatsLoading] = useState<boolean>(false);
  const [catsError, setCatsError] = useState<string>("");

  // Categoría seleccionada
  const initialCat = params.get("category") ?? "";
  const [cat, setCat] = useState<string>(initialCat);

  // Cargar categorías al montar el componente
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setCatsLoading(true);
        setCatsError("");
        const apiBase = (import.meta.env.VITE_API_URL as string) ?? "http://localhost:8080/api";
        const res = await fetch(`${apiBase}/categories`);
        if (!res.ok) throw new Error(`Error: ${res.status}`);
        const data = (await res.json()) as CategoryDTO[];
        if (!alive) return;
        setCats(data);
      } catch (e) {
        // Aquí se usa catsError para guardar el mensaje
        setCatsError(e instanceof Error ? e.message : "Error cargando categorías");
      } finally {
        setCatsLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  // Sincronizar URL con búsqueda y categoría
  useEffect(() => {
    const next = new URLSearchParams(params);
    if (qDebounced) next.set("q", qDebounced); else next.delete("q");
    if (cat) next.set("category", cat); else next.delete("category");
    setParams(next, { replace: true });
  }, [qDebounced, cat]);

  const categoryOptions = useMemo(() => {
    const base = [{ value: "", label: "Todas" }];
    const fromApi = cats.map(c => ({ value: c.id, label: c.name }));
    return base.concat(fromApi);
  }, [cats]);

  return (
    <header className="fixed w-full top-0 left-0 right-0 z-50 bg-[#1a1d1f]/95 backdrop-blur border-b border-stone-800 text-zinc-100">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div className="h-16 flex items-center gap-2 sm:gap-4">
          
          {/* Logo y Nombre */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="h-9 w-9 rounded-xl bg-[#2a2a28] border border-stone-700 flex items-center justify-center overflow-hidden">
              <img
                src="/princys_img/logo.jpg"
                alt="Logo"
                className="h-full w-full object-cover"
              />
            </div>
            <span className="hidden lg:inline text-lg font-semibold tracking-wide text-zinc-100">
              Vapitos Princys
            </span>
          </Link>

          {/* Navegación Principal */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#181b1d] border border-transparent hover:border-stone-800 transition-colors"
            >
              <Home className="size-4 text-zinc-300" />
              <span className="hidden md:inline text-sm text-zinc-300">Home</span>
            </Link>

            <Link
              to="/mayoristas"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all shrink-0"
            >
              <TrendingUp className="size-4" />
              <span className="text-xs sm:text-sm font-bold uppercase tracking-tight">Mayoreo</span>
            </Link>
          </nav>

          {/* Buscador y Uso de catsError */}
          <div className="ml-auto flex-1 min-w-0 max-w-2xl pl-2">
            <div className="relative flex items-center rounded-full bg-[#0f1113] ring-1 ring-stone-800 focus-within:ring-2 focus-within:ring-stone-600 transition">
              <Search className="absolute left-3 size-4 text-zinc-400 pointer-events-none" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar..."
                className="w-full pl-10 pr-28 sm:pr-44 py-2.5 sm:py-3 text-xs sm:text-sm bg-transparent placeholder:text-zinc-500 text-zinc-100 outline-none"
              />

              <div className="absolute inset-y-0 right-10 sm:right-12 flex items-center pr-1.5">
                <select
                  value={cat}
                  onChange={(e) => setCat(e.target.value)}
                  className="bg-[#1f2123] text-zinc-200 ring-1 ring-stone-800 rounded-full px-2 py-1 text-[10px] sm:text-xs outline-none hover:ring-stone-700 w-20 sm:w-32 truncate cursor-pointer"
                  disabled={catsLoading}
                >
                  {categoryOptions.map(opt => (
                    <option key={opt.value || "all"} value={opt.value} className="bg-[#0f1113]">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="absolute right-1 sm:right-2">
                <CartButton />
              </div>
            </div>

            {/* BLOQUE DE ERROR: Aquí es donde se "usa" catsError para que no te dé el aviso */}
            {catsError && (
              <div className="absolute top-full mt-1 left-4 text-[10px] text-red-400 font-medium">
                {catsError}
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}