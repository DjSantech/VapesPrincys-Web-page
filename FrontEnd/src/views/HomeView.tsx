// src/views/HomeView.tsx
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getProducts } from "../services/products_service";
import type { Product } from "../types/Product";
import ProductCard from "../components/ProductCard";
import Container from "../components/Container";

/** ───────── helpers de tipos seguros ───────── */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
function hasBooleanKey<T extends object, K extends PropertyKey>(
  obj: T,
  key: K
): obj is T & Record<K, boolean> {
  return isRecord(obj) && typeof (obj as Record<PropertyKey, unknown>)[key] === "boolean";
}
function hasStringArrayKey<T extends object, K extends PropertyKey>(
  obj: T,
  key: K
): obj is T & Record<K, string[]> {
  const v = isRecord(obj) ? (obj as Record<PropertyKey, unknown>)[key] : undefined;
  return Array.isArray(v) && v.every((x) => typeof x === "string");
}
function getCategoryNameFromProduct(p: Product): string {
  // category: string
  if ("category" in p) {
    const cat = (p as Record<string, unknown>)["category"];
    if (typeof cat === "string") return cat;
    // category: { name: string }
    if (isRecord(cat) && "name" in cat && typeof (cat as Record<string, unknown>)["name"] === "string") {
      return (cat as Record<string, unknown>)["name"] as string;
    }
  }
  // categoryName: string
  if ("categoryName" in p && typeof (p as Record<string, unknown>)["categoryName"] === "string") {
    return (p as Record<string, unknown>)["categoryName"] as string;
  }
  return "Otros";
}
function isVisibleProduct(p: Product): boolean {
  // visible o isActive si existen; por defecto true
  if (hasBooleanKey(p, "visible")) return p["visible"];
  if (hasBooleanKey(p, "isActive")) return p["isActive"];
  return true;
}
function isPopularProduct(p: Product): boolean {
  if (hasBooleanKey(p, "isPopular")) return p["isPopular"];
  if (hasBooleanKey(p, "populares")) return p["populares"];
  if (hasBooleanKey(p, "featured")) return p["featured"];
  if (hasBooleanKey(p, "destacado")) return p["destacado"];
  if (hasStringArrayKey(p, "tags")) return p["tags"].includes("popular");
  if (hasStringArrayKey(p, "badges")) return p["badges"].includes("popular");
  return false;
}

/** ───────── componente ───────── */
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

        // ✅ Solo productos visibles/activos, de forma segura
        const visibles = data.filter(isVisibleProduct);

        if (active) setItems(visibles);
      } catch (e) {
        console.error("Error al obtener productos:", e);
        if (active) setError("No pudimos cargar los productos.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [q, category]);

  // 🗂️ Agrupación (solo cuando no hay filtros)
  const { popularItems, categoryGroups, orderedCategoryNames } = useMemo(() => {
    const popular = items.filter(isPopularProduct);

    const groups = new Map<string, Product[]>();
    items.forEach((p) => {
      // Evitar duplicar en su categoría si ya está en Populares
      if (isPopularProduct(p)) return;
      const cat = getCategoryNameFromProduct(p);
      if (!groups.has(cat)) groups.set(cat, []);
      groups.get(cat)!.push(p);
    });

    let names = Array.from(groups.keys()).sort((a, b) => a.localeCompare(b, "es"));

    // Si existe alguna categoría llamada "Populares" o "populares", la mueve al inicio
    names = names.sort((a) =>
      a.toLowerCase() === "populares" ? -1 : 1
    );
    return { popularItems: popular, categoryGroups: groups, orderedCategoryNames: names };
  }, [items]);

  // 🔄 Grid reutilizable y tipado
  const Grid = ({ products }: { products: Product[] }) => (
    <div className="mt-4 grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {products.map((p) => (
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
  );

  return (
    <Container>
      <h1 className="text-3xl font-bold text-white">Bienvenido a Vapitos Princys</h1>
      <p className="mt-2 text-white/70">Explora nuestros productos o usa el buscador.</p>

      {error && <p className="mt-4 text-red-400">{error}</p>}

      {loading ? (
        <div className="mt-6 grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="h-32 sm:h-40 md:h-48 rounded-xl bg-white/5 border border-white/10 animate-pulse"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="mt-6 text-white/60">No encontramos productos con esos filtros.</p>
      ) : q || category ? (
        // 🔍 Con filtros: grid plano
        <Grid products={items} />
      ) : (
        // 🏠 Sin filtros: Populares primero y luego categorías
        <div className="mt-4 space-y-8">
          {popularItems.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold text-white">Populares</h2>
              <Grid products={popularItems} />
            </section>
          )}

          {orderedCategoryNames.map((cat) => {
            const products = categoryGroups.get(cat);
            if (!products || products.length === 0) return null;
            return (
              <section key={cat}>
                <h2 className="text-2xl font-semibold text-white">{cat}</h2>
                <Grid products={products} />
              </section>
            );
          })}
        </div>
      )}
    </Container>
  );
}
