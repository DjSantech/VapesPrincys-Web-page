// src/components/ProductCard.tsx
import { Link } from "react-router-dom";

export type ProductCardProps = {
  id: string;
  name: string;
  price: number; // en centavos
  imageUrl?: string;
  className?: string;
};

const formatPrice = (cents: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(cents / 100);

export default function ProductCard({
  id,
  name,
  price,
  imageUrl,
  className = "",
}: ProductCardProps) {
  const fallback = "https://picsum.photos/seed/vape/600/600";
  const img = imageUrl || fallback;

  return (
    <Link
      to={`/product/${id}`}
      className={`group block rounded-xl border border-stone-700 bg-[#1a1d1f] overflow-hidden 
                  shadow-md hover:-translate-y-1 hover:shadow-xl transition-all duration-200 ease-out 
                  focus:outline-none focus:ring-2 focus:ring-amber-400 ${className}`}
      aria-label={`Ver ${name}`}
    >
      {/* Imagen del producto */}
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

      {/* Detalle del producto */}
      <div className="p-3 sm:p-4 bg-[#111315] group-hover:bg-[#181b1d] transition-colors duration-300">
        <h1 className="line-clamp-1 text-sm sm:text-base md:text-lg font-semibold text-zinc-100">
          {name}
        </h1>
        <p className="mt-1 text-sm sm:text-base md:text-lg font-bold text-amber-400">
          {formatPrice(price)}
        </p>
      </div>
    </Link>
  );
}
