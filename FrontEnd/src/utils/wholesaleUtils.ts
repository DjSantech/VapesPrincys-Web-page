    export const calculateWholesalePrice = (basePrice: number, quantity: number): number => {
  if (quantity >= 50) return basePrice * 0.70; // 30% descuento
  if (quantity >= 30) return basePrice * 0.80; // 20% descuento
  if (quantity >= 10) return basePrice * 0.90; // 10% descuento
  return basePrice;
};

export const MIN_WHOLESALE_QTY = 10;