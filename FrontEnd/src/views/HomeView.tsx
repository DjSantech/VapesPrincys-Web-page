// src/views/HomeView.tsx
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getProducts } from "../services/products_service";
import type { Product } from "../types/Product";
import ProductCard from "../components/ProductCard";

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
        // 👇 si no hay filtros, no envíes params
        const data = await getProducts(q || category ? { q, category } : undefined);
        if (active) setItems(data);
      } catch (e) {
        if (active) setError("No pudimos cargar los productos.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [q, category]);

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold">Bienvenido a Vapitos Princys</h1>
      <p className="mt-2 text-white/70">Explora nuestros productos o usa el buscador.</p>

      {error && <p className="mt-4 text-red-400">{error}</p>}

      {loading ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-white/5 border border-white/10 h-64 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="mt-6 text-white/60">No encontramos productos con esos filtros.</p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {items.map((p) => (
            <ProductCard key={p.id} id={p.id} name={p.name} price={p.price} imageUrl={p.imageUrl} />
          ))}
        </div>
      )}
    </div>
  );
}
