export interface Product {
  id: string;
  name: string;
  price: number;       // en centavos
  description?: string;
  imageUrl?: string;
  images?: string[];
  stock?: number;
  category?: string;
  categoryId?: string;
}
