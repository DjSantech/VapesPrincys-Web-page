import { Product } from "../types/product";

export const PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Vape Desechable 3000 Puffs",
    price: 60000, // pesos -> si tu front espera centavos, usa 60000*100
    description: "Sabor mango, 3000 puffs.",
    imageUrl: "/princys_img/airmez_image.jpeg",
    stock: 12
  },
  {
    id: "2",
    name: "Pod Recargable",
    price: 120000,
    description: "Pod con cartuchos intercambiables.",
    imageUrl: "/princys_img/pod.jpeg",
    stock: 7
  }
];
