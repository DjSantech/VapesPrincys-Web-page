export type CartAddOnCharger = { id: string; name: string; price: number }; // centavos
export type CartAddOnExtraVape = { model: string; flavor?: string; qty: number; price: number };
export type CartAddOnGiftVape = { model: string; flavor?: string };

export type CartItem = {
  id: string;          // productId
  name: string;
  price: number; 
  dropshippingPrice?: number;      
  qty: number;
  flavor?: string;
  imageUrl?: string;
  ml?: number;      // nuevo campo
  puffs?: number;   // nuevo campo
  pluses?: string[];
  // add-ons
  charger?: CartAddOnCharger | null;
  extraVape?: CartAddOnExtraVape | null;
  giftVape?: CartAddOnGiftVape | null;
};

export type CartState = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
  updateQty: (productId: string, qty: number) => void;
  total: () => number; // en centavos
};
