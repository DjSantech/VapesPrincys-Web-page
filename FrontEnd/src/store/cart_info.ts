// src/store/cart_info.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, CartState } from "../types/Cart";
import type { DeliveryInfo } from "../types/checkout";

// 🔥 DEFINICIÓN DE TIPOS EXTENDIDOS
type CartStateExtended = CartState & {
  open: boolean; 
  setOpen: (open: boolean) => void; 
  delivery?: DeliveryInfo;
  setDelivery: (d: DeliveryInfo) => void;
  deliveryFee: () => number;      // Retorna centavos
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
      // ======= estado visibilidad =======
      open: false,
      setOpen: (open: boolean) => set({ open }),

      // ======= estado carrito =======
      items: [],
      addItem: (item: CartItem) => {
        const items = get().items.slice();
        const idx = items.findIndex((i) =>
          i.id === item.id &&
          i.flavor === item.flavor &&
          JSON.stringify(i.charger) === JSON.stringify(item.charger) &&
          JSON.stringify(i.extraVape) === JSON.stringify(item.extraVape) &&
          JSON.stringify(i.giftVape) === JSON.stringify(item.giftVape)
        );
        if (idx >= 0) items[idx].qty += item.qty;
        else items.push(item);
        set({ items });
      },
      
      removeItem: (productId: string) =>
        set({ items: get().items.filter((i) => i.id !== productId) }),

      clear: () => set({ items: [], delivery: undefined, open: false }),

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

      // ======= estado domicilio =======
      delivery: undefined,
      setDelivery: (d: DeliveryInfo) => set({ delivery: d }),

      /**
       * Calcula el costo del domicilio basado en la zona y la hora actual.
       * Si es después de las 11:00 PM o antes de las 6:00 AM, aplica tarifa nocturna.
       */
      deliveryFee: () => {
        const d = get().delivery;
        if (!d) return 0;

        // Obtener hora actual del dispositivo
        const now = new Date();
        const hour = now.getHours();
        
        // Condición: 11 PM (23h) hasta las 5:59 AM
        const isNight = hour >= 23 || hour < 6;

        // Seleccionar el diccionario de precios correspondiente
        const currentFees = isNight ? NIGHT_FEES : DELIVERY_FEES;

        return currentFees[d.zone] ?? 0;
      },

      totalWithDelivery: () => get().total() + get().deliveryFee(),
    }),
    {
      name: "vapes-cart",
      // Evitamos que 'open' se guarde en localStorage para que el carrito 
      // no aparezca abierto al recargar la página.
      partialize: (state) => {
        const { open, setOpen, ...persistedState } = state;
        return persistedState;
      }
    }
  )
);