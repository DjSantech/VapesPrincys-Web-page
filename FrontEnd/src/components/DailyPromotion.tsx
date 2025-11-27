// src/components/DailyPromotion.tsx
import { Link } from "react-router-dom";

interface DailyPromotionProps {
  productId: string;
  productName: string;
  imageUrl: string;
}

export default function DailyPromotion({ productId, productName, imageUrl }: DailyPromotionProps) {
  return (
    <Link
      to={`/product/${productId}`}
      className="block w-full relative group cursor-pointer"
    >
      {/* Imagen del banner */}
      <img
        src={imageUrl}
        alt={productName}
        className="w-full rounded-xl object-cover transition-all duration-300 group-hover:brightness-90"
      />

      {/* Texto encima de la imagen */}
      <div className="absolute bottom-4 left-4 text-white font-bold text-lg sm:text-2xl drop-shadow-lg">
        {productName}
      </div>
    </Link>
  );
}
