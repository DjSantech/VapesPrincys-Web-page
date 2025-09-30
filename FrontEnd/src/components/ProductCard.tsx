import { Link } from "react-router-dom";

export type ProductCardProps = {
  id: string;
  name: string;
  price: number;      // en centavos
  imageUrl?: string;
  className?: string;
};

const formatPrice = (cents: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 })
    .format(cents / 100);

export default function ProductCard({ id, name, price, imageUrl, className = "" }: ProductCardProps) {
  const fallback = "https://picsum.photos/seed/vape/600/600";
  const img = imageUrl || fallback;

  return (
    <Link
      to={`/product/${id}`}
      className={`group block rounded-2xl border border-green-700 bg-[#182c25] overflow-hidden
                  shadow-sm transition-all duration-200 ease-out
                  hover:-translate-y-1 hover:shadow-lg focus:outline-none
                  focus:ring-2 focus:ring-green-400 ${className}`}
      aria-label={`Ver ${name}`}
    >
      {/* Imagen */}
      <div className="relative overflow-hidden bg-gray-900">
        <img
          src={img}
          alt={name}
          loading="lazy"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = fallback }}
          className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
        />
      </div>

      {/* Texto */}
      <div className="p-4">
        <h1 className="line-clamp-1 text-3xl font-bold text-white">{name}</h1>
        <p className="mt-1 text-lg font-bold text-green-400">{formatPrice(price)}</p>
      </div>
    </Link>
  );
}
