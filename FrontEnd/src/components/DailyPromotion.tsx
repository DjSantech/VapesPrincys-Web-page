// src/components/DailyPromotion.tsx
import { Link } from "react-router-dom";


interface DailyPromotionProps {
  productId: string;
  productName: string;
  imageUrl: string;
  discount: number;
  finalPrice: number;
}

export default function DailyPromotion({ productId, productName, imageUrl,discount, finalPrice }: DailyPromotionProps) {
  return (
    <Link
      to={`/product/${productId}?discount=${discount}&finalPrice=${finalPrice}`}
      className="block"
    >
      {/* Imagen del banner */}
      <img
        src={imageUrl}
        alt={productName}
        className="w-full rounded-xl object-cover"
      />

      {/* Texto abajo de la imagen */}
      <div className="mt-4 text-center">
        <p className="text-lg sm:text-xl font-bold text-white">{productName}</p>

        <p className="text-green-400 font-semibold text-sm">
          Ahora: ${finalPrice.toFixed(0)}
        </p>

        <p className="text-red-400 text-xs">-{discount}% descuento</p>
      </div>
    </Link>
  );
}
