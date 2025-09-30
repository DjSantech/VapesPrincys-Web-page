export interface Product {
  id: string;
  name: string;
  price: number;        // en centavos
  description?: string; // opcional
  stock?: number;       // opcional
  imageUrl?: string;    // para simplificar un solo campo
  images?: string[];    // si en el futuro guardas varias imágenes
  categoryId?: string;  // si vas a manejar categorías
}