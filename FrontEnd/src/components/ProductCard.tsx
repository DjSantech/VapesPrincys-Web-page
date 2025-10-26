// src/components/ProductCard.tsx
import { Link } from "react-router-dom";

export type ProductCardProps = {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  className?: string;
  pluses?: string[];
  puffs?: number;
  ml?: number; // ✅ nuevo campo
};

const formatPrice = (pesos: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(pesos || 0);

export default function ProductCard({
  id,
  name,
  price,
  imageUrl,
  className = "",
  pluses = [],
  puffs,
  ml,
}: ProductCardProps) {
  const fallback = "https://picsum.photos/seed/vape/600/600";
  const img = imageUrl || fallback;

  const hasPlus = Array.isArray(pluses) && pluses.length > 0;
  const mainPlus = hasPlus ? String(pluses[0] ?? "").toUpperCase() : "";
  const extraPluses = hasPlus && pluses.length > 1 ? pluses.length - 1 : 0;

  return (
    <Link
      to={`/product/${id}`}
      className={`group block rounded-xl border border-stone-700 bg-[#1a1d1f] overflow-hidden 
                  shadow-md hover:-translate-y-1 hover:shadow-xl transition-all duration-200 ease-out 
                  focus:outline-none focus:ring-2 focus:ring-amber-400 ${className}`}
      aria-label={`Ver ${name}`}
    >
      {/* Imagen */}
      <div className="relative overflow-hidden bg-black/20">
        <img
          src={img}
          alt={name}
          loading="lazy"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = fallback;
          }}
          className="w-full h-40 sm:h-48 md:h-56 object-cover transition-transform duration-300 ease-out group-hover:scale-105"
        />
      </div>

      {/* Detalles */}
      <div className="p-3 sm:p-4 bg-[#111315] group-hover:bg-[#181b1d] transition-colors duration-300">
        <h1 className="line-clamp-1 text-sm sm:text-base md:text-lg font-semibold text-zinc-100">
          {name}
        </h1>

        <div className="mt-1 flex items-center justify-between">
          <p className="text-sm sm:text-base md:text-lg font-bold text-amber-400">
            {formatPrice(price)}
          </p>

          {hasPlus && (
            <span
              title={pluses.join(", ")}
              className="inline-flex items-center gap-1 rounded-lg
                         border border-amber-400/30
                         bg-gradient-to-br from-amber-500/20 via-fuchsia-500/20 to-sky-500/20
                         px-2 py-0.5
                         text-[10px] sm:text-xs font-extrabold tracking-wide text-amber-200
                         shadow-[0_0_0_1px_rgba(251,191,36,0.12),0_0_12px_rgba(251,191,36,0.25)]
                         ring-1 ring-amber-400/30
                         backdrop-blur-[2px] select-none"
            >
              <span className="drop-shadow">{mainPlus}</span>
              {extraPluses > 0 && (
                <span className="opacity-90 font-semibold">+{extraPluses}</span>
              )}
            </span>
          )}
        </div>

        {/* Mostrar puffs o ml */}
        {typeof puffs === "number" && puffs > 0 ? (
          <p className="mt-1 text-[11px] sm:text-xs text-zinc-400">
            {new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(puffs)} puffs
          </p>
        ) : typeof ml === "number" && ml > 0 ? (
          <p className="mt-1 text-[11px] sm:text-xs text-zinc-400">
            {new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(ml)} ml
          </p>
        ) : null}
      </div>
    </Link>
  );
}
