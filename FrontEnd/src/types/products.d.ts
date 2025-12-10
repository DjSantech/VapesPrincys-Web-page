export interface ProductCreateForm {
  sku: string;
  name: string;
  price: number;
  image: File | null;
  
  // AÑADIDOS para el formulario detallado:
  description: string;
  stock: number;
  puffs: number;
  ml: number;
  visible: boolean;
  category: string;
  flavors: string[];      // Array de strings para los sabores
  hasFlavors: boolean;
  pluses: string[];       // Array de strings para los pluses
}