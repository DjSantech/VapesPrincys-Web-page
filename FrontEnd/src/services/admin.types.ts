// src/services/admin.types.ts
export interface WholesaleRates {
  tier1: number; // 10 a 30 unidades
  tier2: number; // 31 a 50 unidades
  tier3: number; // 51 a 80 unidades
}

export interface AdminProduct {
  id: string;
  sku: string;
  name: string;
  description?: string;
  price: number;
  dropshipperPrice: number;
  stock: number;
  puffs: number;
  ml: number;
  visible: boolean;
  visibleWhoSale: boolean;
  imageUrl: string;
  category: string;
  flavors: string[];
  hasFlavors: boolean;
  pluses?: string[];
  wholesaleRates: WholesaleRates;
}

export interface CreateProductPayload {
  sku: string;
  name: string;
  description?: string;
  price: number;
  dropshipperPrice: number;
  stock?: number;
  puffs: number;
  ml: number;
  visible?: boolean;
  visibleWhoSale?: boolean;
  category?: string;
  image?: File | null;
  flavors?: string[];
  hasFlavors: boolean;
  pluses?: string[];
  wholesaleRates: WholesaleRates;
}

export type PatchProductPayload = Partial<
  Pick<
    AdminProduct,
      | "sku"
      | "name"
      | "description"
      | "price"
      | "dropshipperPrice"
      | "stock"
      | "puffs"
      | "visible"
      | "visibleWhoSale"
      | "category"
      | "flavors"
      | "pluses"
      | "ml"
      | "hasFlavors"
      | "wholesaleRates"
  >
>;

export interface AdminCategory {
  id: string;
  name: string;
  homeOrder?: number;
  imageUrl?: string;
}

export interface AdminPlus {
  id: string;
  name: string;
}

