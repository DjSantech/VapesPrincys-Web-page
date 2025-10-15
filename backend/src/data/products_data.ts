import { Product } from "../types/Product";

export const PRODUCTS: Product[] = [
  {
    id: "1",
    name: "SnoopDogVape",
    price: 2400000, // pesos -> si tu front espera centavos, usa 60000*100
    description: "Sabor mango, 7000 puffs.",
    imageUrl: "/princys_img/SnoopDogVape.jpg",
    stock: 99,
    category: "Desechables"
  },
];


