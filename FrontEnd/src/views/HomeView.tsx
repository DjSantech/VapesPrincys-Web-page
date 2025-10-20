// src/views/HomeView.tsx
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getProducts } from "../services/products_service";
import type { Product } from "../types/Product";
import ProductCard from "../components/ProductCard";
import Container from "../components/Container";

export default function HomeView() {
  const [params] = useSearchParams();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const q = params.get("q") || undefined;
  const category = params.get("category") || undefined;

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setError("");
        setLoading(true);
        const data = await getProducts(q || category ? { q, category } : undefined);

        // ✅ Solo productos visibles/activos
        const visibles = data.filter(p => (p.visible ?? p.isActive ?? true) === true);

        if (active) setItems(visibles);
      } catch (e) {
        console.error("Error al obtener productos:", e);
        if (active) setError("No pudimos cargar los productos.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [q, category]);

  return (
    <Container>
      <h1 className="text-3xl font-bold text-white">Bienvenido a Vapitos Princys</h1>
      <p className="mt-2 text-white/70">Explora nuestros productos o usa el buscador.</p>

      {error && <p className="mt-4 text-red-400">{error}</p>}

      {loading ? (
        <div className="mt-6 grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-32 sm:h-40 md:h-48 rounded-xl bg-white/5 border border-white/10 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="mt-6 text-white/60">No encontramos productos con esos filtros.</p>
      ) : (
        <div className="mt-4 grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {items.map((p) => (
            <ProductCard
              key={p.id}
              id={p.id}
              name={p.name}
              price={p.price}
              imageUrl={p.imageUrl}
              className="!p-0"
            />
          ))}
        </div>
      )}
    </Container>
  );
}
