import React from 'react';
import { Link } from 'react-router-dom';

interface DailyPromotionProps {
  /** El ID del producto para construir el enlace a su detalle. */
  productId: string;
  /** La URL de la imagen del producto promocional. */
  imageUrl: string;
  /** El nombre del producto (solo para accesibilidad, no visible). */
  productName: string;
}

/**
 * Componente que muestra el banner de promoción horizontal del día.
 * Es clickeable y lleva al detalle del producto.
 */
export default function DailyPromotion({ productId, imageUrl, productName }: DailyPromotionProps) {
  // Construye el enlace de destino
  const detailPath = `/product-detail/${productId}`;

  return (
    // Usa Link para la navegación en React Router. Ocupa todo el ancho (w-full)
    <Link 
      to={detailPath}
      className="block w-full rounded-xl overflow-hidden shadow-2xl transition duration-300 transform hover:scale-[1.005] hover:shadow-primary/50 relative group"
    >
      {/* La imagen ocupa el 100% del contenedor y tiene una relación de aspecto 
        horizontal (por ejemplo, 16/5) para hacerlo un banner.
        Las esquinas redondeadas están en el 'Link' padre.
      */}
      <img
        src={imageUrl}
        alt={`Promoción del día: ${productName}`}
        className="w-full h-full object-cover transition duration-500 group-hover:opacity-90"
        // Estilo para forzar la relación de aspecto horizontal y asegurar un tamaño visible
        style={{ aspectRatio: '16 / 5' }} 
        // Si la imagen falla, usamos un fondo oscuro de placeholder
        onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "https://placehold.co/800x250/1C1C1E/FFFFFF?text=Promoción+Diaria+Placeholder";
            target.style.aspectRatio = '16 / 5';
        }}
      />
      
      {/* Overlay sutil para dar feedback visual al pasar el mouse, 
        indicando que es clickeable.
      */}
      <div className="absolute inset-0 bg-black/20 opacity-0 transition duration-300 group-hover:opacity-100 flex items-center justify-center">
          <span className="text-white text-xl font-bold p-3 bg-black/50 rounded-lg shadow-lg">
              Ver Detalles
          </span>
      </div>
    </Link>
  );
}