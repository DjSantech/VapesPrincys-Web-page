// src/store/cart_info.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, CartState } from "../types/Cart";
import type { DeliveryInfo } from "../types/checkout";

type CartStateExtended = CartState & {
  open: boolean;
  setOpen: (open: boolean) => void;
  // ======= estado dropshipping =======
  isDropshipping: boolean;
  setDropshipping: (val: boolean) => void;
  sellerId?: string;
  setSellerId: (id: string) => void;
  // ------------------------------------
  delivery?: DeliveryInfo;
  setDelivery: (d: DeliveryInfo) => void;
  deliveryFee: () => number;
  totalWithDelivery: () => number;
};
export const DELIVERY_ZONES = [
  { value: "DOSQUEBRADAS", label: "Dosquebradas" },
  { value: "PEREIRA_CENTRO", label: "Pereira Centro" },
  { value: "CUBA", label: "Cuba" },
  { value: "GALICIA", label: "Galicia" },
  { value: "SANTA_ROSA", label: "Santa Rosa" },
  { value: "NACIONAL", label: "Envío Nacional" },
] as const;

export const DELIVERY_FEES = {
  DOSQUEBRADAS: 7000,
  PEREIRA_CENTRO: 10000,
  CUBA: 13000,
  GALICIA: 18000,
  SANTA_ROSA: 18000,
  NACIONAL: 15000,
};

export const NIGHT_FEES = {
  DOSQUEBRADAS: 8000,
  PEREIRA_CENTRO: 12000,
  CUBA: 15000,
  GALICIA: 20000,
  SANTA_ROSA: 20000,
  NACIONAL: 15000,
};
export const useCart = create<CartStateExtended>()(
  persist(
    (set, get) => ({
      // ======= estado dropshipping =======
      isDropshipping: false, // Por defecto es falso
      sellerId: undefined,
      setDropshipping: (val: boolean) => set({ isDropshipping: val }),
      setSellerId: (id: string) => set({ sellerId: id }),

      // ======= estado visibilidad =======
      open: false,
      setOpen: (open: boolean) => set({ open }),

      // ======= estado carrito =======
      items: [],
      addItem: (item: CartItem) => {
        // 🔥 LÓGICA DE PRECIO SEGÚN MODO
        const isDrop = get().isDropshipping;
        // Si el modo dropshipping está activo, usamos dropshippingPrice, si no, el precio normal
        const finalPrice = isDrop && item.dropshippingPrice ? item.dropshippingPrice : item.price;

        const items = get().items.slice();
        const idx = items.findIndex((i) =>
          i.id === item.id &&
          i.flavor === item.flavor &&
          JSON.stringify(i.charger) === JSON.stringify(item.charger) &&
          JSON.stringify(i.extraVape) === JSON.stringify(item.extraVape) &&
          JSON.stringify(i.giftVape) === JSON.stringify(item.giftVape)
        );

        if (idx >= 0) {
          items[idx].qty += item.qty;
          // Actualizamos el precio por si acaso el modo cambió
          items[idx].price = finalPrice; 
        } else {
          // Agregamos el item con el precio final calculado
          items.push({ ...item, price: finalPrice });
        }
        set({ items });
      },
      
      removeItem: (productId: string) =>
        set({ items: get().items.filter((i) => i.id !== productId) }),

      clear: () => set({ items: [], delivery: undefined, open: false, isDropshipping: false, sellerId: undefined }),

      updateQty: (productId: string, qty: number) => {
        const items = get().items.map((i) => (i.id === productId ? { ...i, qty } : i));
        set({ items });
      },

      total: () =>
        get().items.reduce((acc, i) => {
          const addOns =
            (i.charger?.price ?? 0) +
            (i.extraVape ? i.extraVape.price * (i.extraVape.qty || 1) : 0);
          return acc + i.price * i.qty + addOns;
        }, 0),

      delivery: undefined,
      setDelivery: (d: DeliveryInfo) => set({ delivery: d }),

      deliveryFee: () => {
        const d = get().delivery;
        if (!d) return 0;
        const now = new Date();
        const hour = now.getHours();
        const isNight = hour >= 23 || hour < 6;
        const currentFees = isNight ? NIGHT_FEES : DELIVERY_FEES;
        return currentFees[d.zone] ?? 0;
      },

      totalWithDelivery: () => get().total() + get().deliveryFee(),
    }),
    {
      name: "vapes-cart",
      partialize: (state) => {
        // Excluimos 'open' pero PERSISTIMOS 'isDropshipping' y 'sellerId'
        // para que si el cliente refresca la página, sigan los precios de vendedor.
        const { open, setOpen, ...persistedState } = state;
        return persistedState;
      }
    }
  )
);