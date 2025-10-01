import { Product } from "../types/product";

export const PRODUCTS: Product[] = [
  {
    id: "1",
    name: "AIRMEZ MARS",
    price: 6000000, // pesos -> si tu front espera centavos, usa 60000*100
    description: "Sabor mango, 22000 puffs.",
    imageUrl: "/princys_img/airmez_image.jpeg",
    stock: 12
  },
  {
    id: "2",
    name: "DRILIZY",
    price: 6000000, // pesos -> si tu front espera centavos, usa 60000*100
    description: "Sabor fresa, 15000 puffs.",
    imageUrl: "/princys_img/drilizy_image.jpeg",
    stock: 12
  },
  {
    id: "3",
    name: "EASE VAPE",
    price: 6000000, // pesos -> si tu front espera centavos, usa 60000*100
    description: "Sabor watermelon, 8000 puffs.",
    imageUrl: "/princys_img/ease_vape.jpeg",
    stock: 12
  },
  {
    id: "4",
    name: "EASY",
    price: 6000000, // pesos -> si tu front espera centavos, usa 60000*100
    description: "Sabor kiwi, 9000 puffs.",
    imageUrl: "/princys_img/easy_image.jpeg",
    stock: 12
  },
];


