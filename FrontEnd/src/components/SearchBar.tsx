// src/components/SearchBar.tsx
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import useDebounce from "../hooks/useDebounce";

const CATEGORIES = ["", "Desechables", "Pods", "Líquidos", "Accesorios"]; // "" = Todas

export default function SearchBar() {
  const [params, setParams] = useSearchParams();
  const [term, setTerm] = useState<string>(params.get("q") ?? "");
  const [cat, setCat] = useState<string>(params.get("category") ?? "");

  const debouncedTerm = useDebounce(term, 350);

  useEffect(() => {
    const next = new URLSearchParams(params);
    if (debouncedTerm) next.set("q", debouncedTerm);
    else next.delete("q");

    if (cat) next.set("category", cat);
    else next.delete("category");

    setParams(next, { replace: true });
  }, [debouncedTerm, cat]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex w-full max-w-xl items-center gap-2">
      {/* Input búsqueda */}
      <div className="flex-1 rounded-xl bg-white/10 border border-white/20 px-3 py-2">
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Buscar (nombre del vape)"
          className="w-full bg-transparent outline-none text-sm text-white placeholder:text-white/60"
        />
      </div>

      {/* Categorías */}
      <div className="relative">
        <select
          className="rounded-xl bg-white/10 border border-white/20 px-3 py-2 text-sm text-white"
          value={cat}
          onChange={(e) => setCat(e.target.value)}
          title="Categorías"
        >
          {CATEGORIES.map((c) => (
            <option key={c || "all"} value={c}>
              {c || "Todas las categorías"}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
