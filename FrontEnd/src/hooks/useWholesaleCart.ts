import { useState } from 'react';
import { calculateWholesalePrice } from '../utils/wholesaleUtils';
import type { AdminProduct } from '../services/admin';

export interface WholesaleItem {
  productId: string;
  name: string;
  flavor: string;
  quantity: number;
  product: AdminProduct; // Guardamos el producto para recalcular precios si cambia la cantidad
  totalPriceWithDiscount: number; 
}

export function useWholesaleCart() {
  const [cart, setCart] = useState<WholesaleItem[]>([]);

  const addToCart = (product: AdminProduct, flavor: string, quantity: number) => {
    setCart(prev => {
      // Calculamos el precio real usando la utilidad y el objeto producto
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
        newCart[existingIndex] = newItem;
        return newCart;
      }
      
      return [...prev, newItem];
    });
  };

  const total = cart.reduce((acc, item) => acc + (item.totalPriceWithDiscount * item.quantity), 0);

  return { cart, addToCart, total };
}