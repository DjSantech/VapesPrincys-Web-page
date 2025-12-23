import { useState } from 'react';
import { calculateWholesalePrice } from '../utils/wholesaleUtils';
import type { AdminProduct } from '../services/admin.types';

export interface WholesaleItem {
  productId: string;
  name: string;
  flavor: string;
  quantity: number;
  // Guardamos el producto completo para tener acceso a sus wholesaleRates en cualquier momento
  product: AdminProduct; 
  totalPriceWithDiscount: number; 
}

export function useWholesaleCart() {
  const [cart, setCart] = useState<WholesaleItem[]>([]);

  const addToCart = (product: AdminProduct, flavor: string, quantity: number) => {
    setCart(prev => {
      // 1. Calculamos el precio unitario correcto usando el objeto producto completo
      const realUnitPrice = calculateWholesalePrice(product, quantity);
      
      const newItem: WholesaleItem = {
        productId: product.id,
        name: product.name,
        flavor: flavor,
        quantity: quantity,
        product: product,
        totalPriceWithDiscount: realUnitPrice
      };

      const existingIndex = prev.findIndex(
        i => i.productId === product.id && i.flavor === flavor
      );

      if (existingIndex > -1) {
        const newCart = [...prev];
        // Si ya existe, reemplazamos con la nueva cantidad y el nuevo precio calculado
        newCart[existingIndex] = newItem;
        return newCart;
      }
      
      return [...prev, newItem];
    });
  };

  // El total es: precio_con_descuento * cantidad
  const total = cart.reduce((acc, item) => acc + (item.totalPriceWithDiscount * item.quantity), 0);

  return { cart, addToCart, total };
}