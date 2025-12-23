import type { AdminProduct } from '../services/admin.types';

// 🚩 Definimos y exportamos el mínimo para que no de error el import
export const MIN_WHOLESALE_QTY = 10;

/**
 * Calcula el precio unitario basado en los rangos:
 * Tier 1: 10 - 30
 * Tier 2: 31 - 50
 * Tier 3: 51+
 */
export function calculateWholesalePrice(product: AdminProduct, quantity: number): number {
  // Si por alguna razón no hay tasas definidas o la cantidad es menor al mínimo
  if (!product.wholesaleRates || quantity < MIN_WHOLESALE_QTY) {
    return product.price;
  }

  const { tier1, tier2, tier3 } = product.wholesaleRates;

  if (quantity >= 10 && quantity <= 30) {
    return tier1;
  } else if (quantity >= 31 && quantity <= 50) {
    return tier2;
  } else if (quantity >= 51) {
    return tier3;
  }

  return product.price;
}