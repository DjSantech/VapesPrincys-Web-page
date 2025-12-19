// src/components/DailyPromotion.tsx
import { Link } from "react-router-dom";
import { optimizeImage } from "../utils/cloudinary";

interface DailyPromotionProps {
  productId: string;
  productName: string;
  imageUrl: string;
  discount: number;
  finalPrice: number;
}

export default function DailyPromotion({ 
  productId, 
  productName, 
  imageUrl, 
  discount, 
  finalPrice 
}: DailyPromotionProps) {
  return (
    <Link
      to={`/product/${productId}?discount=${discount}&finalPrice=${finalPrice}`}
      className="relative block w-full h-full group overflow-hidden"
    >
      {/* 1. La Imagen: Ahora ocupa todo el espacio del contenedor */}
      <img
        src={optimizeImage(imageUrl, 1200)}
        alt={productName}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />

      {/* 2. El Overlay (Sombreado inferior para que el texto se lea bien) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-4 sm:p-8">
        
        {/* Etiqueta de Descuento flotante */}
        <div className="absolute top-4 right-4 bg-red-600 text-white text-xs sm:text-sm font-bold px-3 py-1 rounded-full shadow-lg">
          -{discount}% OFF
        </div>

        {/* 3. Información del Producto */}
        <div className="space-y-1">
          <p className="text-white/70 text-xs uppercase tracking-widest font-medium">
            Oferta del día
          </p>
          <h2 className="text-xl sm:text-3xl md:text-4xl font-black text-white uppercase italic leading-none">
            {productName}
          </h2>
          
          <div className="flex items-center gap-3 pt-1">
            <span className="text-emerald-400 text-lg sm:text-2xl font-bold">
              ${finalPrice.toLocaleString('es-CO')}
            </span>
            <span className="text-white/50 text-xs sm:text-sm line-through">
              Ref: ${(finalPrice / (1 - discount/100)).toFixed(0)}
            </span>
          </div>
        </div>

        {/* Botón de acción (solo visible en pantallas medianas+) */}
        <div className="mt-4 hidden sm:block">
           <span className="inline-block bg-white text-black text-xs font-bold px-6 py-2 rounded-full uppercase tracking-tighter group-hover:bg-emerald-400 transition-colors">
             Ver Producto
           </span>
        </div>
      </div>
    </Link>
  );
}