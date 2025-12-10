// src/services/admin.types.ts

export interface AdminProduct {
  id: string;
  sku: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  puffs: number;
  ml: number;
  visible: boolean;
  imageUrl: string;
  category: string;
  flavors: string[];
  hasFlavors: boolean;
  pluses?: string[];
}

export interface CreateProductPayload {
  sku: string;
  name: string;
  description?: string;
  price: number;
  stock?: number;
  puffs: number;
  ml: number;
  visible?: boolean;
  category?: string;
  image?: File | null;
  flavors?: string[];
  hasFlavors: boolean;
  pluses?: string[];
}

export type PatchProductPayload = Partial<
  Pick<
    AdminProduct,
      | "sku"
      | "name"
      | "description"
      | "price"
      | "stock"
      | "puffs"
      | "visible"
      | "category"
      | "flavors"
      | "pluses"
      | "ml"
      | "hasFlavors"
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

