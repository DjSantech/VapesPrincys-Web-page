// src/pages/HomeView.tsx
import ProductCard from "../components/ProductCard";

export default function HomeView() {
  // Demo de productos (precio en PESOS; abajo lo convierto a centavos)
  const products = [
    { id: "1", name: "Airmez", price: 60000, imageUrl: "/princys_img/airmez_image.jpeg" },
    { id: "2", name: "Drilizy",              price: 120000, imageUrl: "/princys_img/drilizy_image.jpeg" },
    { id: "3", name: "Ease vape",       price: 35000, imageUrl: "/princys_img/ease_vape.jpeg" },
    { id: "4", name: "Easy ",              price: 25000,  imageUrl: "/princys_img/easy_image.jpeg" }, 
    { id: "5", name: "Airmez", price: 60000, imageUrl: "/princys_img/airmez_image.jpeg" },
    { id: "6", name: "Drilizy",              price: 120000, imageUrl: "/princys_img/drilizy_image.jpeg" },
    { id: "7", name: "Ease vape",       price: 35000, imageUrl: "/princys_img/ease_vape.jpeg" },
    { id: "8", name: "Easy ",              price: 25000,  imageUrl: "/princys_img/easy_image.jpeg" }, /// sin imagen => usa placeholder
  ];

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold">Bienvenido a Vapitos Princys</h1>
      <p className="mt-2 text-white/70">
        Esta es la página principal temporal. Aquí podrás mostrar productos, categorías o promociones destacadas.
      </p>

      <div className="mt-6 grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {products.map(p => (
          <ProductCard
            key={p.id}
            id={p.id}
            name={p.name}
            price={p.price * 100}          // ← a centavos para el formateador
            imageUrl={p.imageUrl}
            className="bg-white"            // puedes quitarlo si ya viene por defecto
          />
        ))}
      </div>
    </div>
  );
}
