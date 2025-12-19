import { useState } from 'react';
import { calculateWholesalePrice } from '../utils/wholesaleUtils';

export interface WholesaleItem {
  productId: string;
  name: string;
  flavor: string;
  quantity: number;
  unitPrice: number; // El precio unitario base (sin descuento aún)
  totalPriceWithDiscount: number; // El precio final calculado
}

export function useWholesaleCart() {
  const [cart, setCart] = useState<WholesaleItem[]>([]);

  const addToCart = (item: Omit<WholesaleItem, 'totalPriceWithDiscount'>) => {
    setCart(prev => {
      // Calculamos el precio real aquí mismo usando la utilidad importada
      // Esto garantiza que el descuento sea correcto según la cantidad enviada
      const realUnitPrice = calculateWholesalePrice(item.unitPrice, item.quantity);
      
      const newItem: WholesaleItem = {
        ...item,
        totalPriceWithDiscount: realUnitPrice
      };

      const existingIndex = prev.findIndex(
        i => i.productId === item.productId && i.flavor === item.flavor
      );

      if (existingIndex > -1) {
        const newCart = [...prev];
        newCart[existingIndex] = newItem;
        return newCart;
      }
      
      return [...prev, newItem];
    });
  };

  // Cálculo del total general del carrito
  const total = cart.reduce((acc, item) => acc + (item.totalPriceWithDiscount * item.quantity), 0);

  return { cart, addToCart, total };
}