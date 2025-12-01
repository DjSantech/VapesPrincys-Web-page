// src/store/cart_info.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, CartState } from "../types/Cart";
import type { DeliveryInfo } from "../types/checkout";

// 🔥 CAMBIO CLAVE: Agregamos 'open' y 'setOpen' al tipo
type CartStateExtended = CartState & {
  open: boolean; // <-- NUEVA PROPIEDAD: Estado de visibilidad del carrito (booleano)
  setOpen: (open: boolean) => void; // <-- NUEVA FUNCIÓN: Para abrir o cerrar el carrito
  // domicilio
  delivery?: DeliveryInfo;
  setDelivery: (d: DeliveryInfo) => void;
  deliveryFee: () => number;      // en centavos
  totalWithDelivery: () => number;
};

const DELIVERY_FEES: Record<NonNullable<DeliveryInfo["zone"]>, number> = {
  DOSQUEBRADAS: 600000,   // $6.000 -> en centavos
  PEREIRA_CENTRO: 900000,   // $9.000
  CUBA: 1200000,    // $12.000
  NACIONAL: 1500000,    // $15.000 (envío nacional contado)
};

export const useCart = create<CartStateExtended>()(
  persist(
    (set, get) => ({
      // 🔥 IMPLEMENTACIÓN: Estado inicial del carrito (cerrado por defecto)
      open: false,
      // 🔥 IMPLEMENTACIÓN: Función para cambiar el estado 'open'
      setOpen: (open: boolean) => set({ open }),

      // ======= estado carrito =======
      items: [],
      addItem: (item: CartItem) => {          // 👈 usa CartItem (ya no queda “sin usar”)
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

      // Modificamos clear para también cerrar el carrito si está abierto
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

      // ======= domicilio =======
      delivery: undefined,
      setDelivery: (d: DeliveryInfo) => set({ delivery: d }),

      deliveryFee: () => {
        const d = get().delivery;
        if (!d) return 0;
        return DELIVERY_FEES[d.zone] ?? 0;
      },

      totalWithDelivery: () => get().total() + get().deliveryFee(),
    }),
    {
      name: "vapes-cart",
      // 🔥 BUENA PRÁCTICA: Usamos `partialize` para excluir 'open' del localStorage.
      // Esto previene que el carrito se abra automáticamente cada vez que se recarga la página.
      partialize: (state) => {
        const { open, setOpen, ...persistedState } = state;
        return persistedState;
      }
    }
  )
);