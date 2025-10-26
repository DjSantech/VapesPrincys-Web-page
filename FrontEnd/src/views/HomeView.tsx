// src/views/HomeView.tsx
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getProducts } from "../services/products_service";
import type { Product } from "../types/Product";
import ProductCard from "../components/ProductCard";
import Container from "../components/Container";

/* =========================
   Helpers de tipado seguro
   ========================= */

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

function hasStringKey<T extends object, K extends PropertyKey>(
  obj: T,
  key: K
): obj is T & Record<K, string> {
  return isRecord(obj) && typeof (obj as Record<PropertyKey, unknown>)[key] === "string";
}

/** Extrae el número (último bloque numérico) de un SKU para ordenar; si no tiene, va al final. */
function skuNumber(sku?: string): number {
  if (!sku) return Number.MAX_SAFE_INTEGER;
  const m = sku.match(/\d+/g);
  if (!m || m.length === 0) return Number.MAX_SAFE_INTEGER;
  return Number.parseInt(m[m.length - 1] as string, 10);
}

/** Lee el nombre de categoría desde distintas formas posibles en Product. */
function getCategoryNameFromProduct(p: Product): string {
  if ("category" in p) {
    const cat = (p as Record<string, unknown>)["category"];
    if (typeof cat === "string") return cat;
    if (isRecord(cat) && hasStringKey(cat, "name")) return cat.name;
  }

  // Aquí cambiamos la línea problemática
  if (isRecord(p) && typeof (p as Record<string, unknown>)["categoryName"] === "string") {
    return (p as Record<string, unknown>)["categoryName"] as string;
  }

  return "Otros";
}


/** Lee el id de categoría si el backend lo envía; si no, cadena vacía. */
function getCategoryIdFromProduct(p: Product): string {
  if (hasStringKey(p as object, "categoryId")) {
    return (p as Record<"categoryId", string>)["categoryId"];
  }
  return "";
}

/** Producto visible: usa visible o isActive; por defecto true. */
function isVisibleProduct(p: Product): boolean {
  if (hasBooleanKey(p, "visible")) return p["visible"];
  if (hasBooleanKey(p, "isActive")) return p["isActive"];
  return true;
}

/** Populares: múltiples banderas o tags/badges. */
function isPopularProduct(p: Product): boolean {
  if (hasBooleanKey(p, "isPopular")) return p["isPopular"];
  if (hasBooleanKey(p, "populares")) return p["populares"];
  if (hasBooleanKey(p, "featured")) return p["featured"];
  if (hasBooleanKey(p, "destacado")) return p["destacado"];
  if (hasStringArrayKey(p, "tags")) return p["tags"].includes("popular");
  if (hasStringArrayKey(p, "badges")) return p["badges"].includes("popular");
  return false;
}

/* =========================
   Tipos locales
   ========================= */

type PublicCategory = {
  id: string;
  name: string;
  homeOrder?: number;
};

/* =========================
   API pública de categorías
   ========================= */

async function fetchPublicCategories(): Promise<PublicCategory[]> {
  const base = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:8080/api";
  const res = await fetch(`${base}/categories`);
  if (!res.ok) return [];
  return (await res.json()) as PublicCategory[];
}

/* =========================
   Componente
   ========================= */

export default function HomeView() {
  const [params] = useSearchParams();
  const [items, setItems] = useState<Product[]>([]);
  const [cats, setCats] = useState<PublicCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [catsLoading, setCatsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const q = params.get("q") || undefined;
  const category = params.get("category") || undefined;

  // Cargar productos
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setError("");
        setLoading(true);
        const data = await getProducts(q || category ? { q, category } : undefined);
        const visibles = data.filter(isVisibleProduct);
        if (alive) setItems(visibles);
      } catch (e) {
        console.error("Error al obtener productos:", e);
        if (alive) setError("No pudimos cargar los productos.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [q, category]);

  // Cargar categorías (para homeOrder)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setCatsLoading(true);
        const data = await fetchPublicCategories();
        if (alive) setCats(data);
      } finally {
        if (alive) setCatsLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  /* =========================
     Agrupación y orden global
     ========================= */
  const { popularItems, categoryGroups, orderedCategoryNames } = useMemo(() => {
    // Índices para priorizar por id y por nombre
    const orderById = new Map<string, number>(cats.map((c) => [c.id, c.homeOrder ?? 1000]));
    const orderByName = new Map<string, number>(
      cats.map((c) => [c.name.toLowerCase(), c.homeOrder ?? 1000])
    );

    // Populares (ordenados por número de SKU)
    const popular = items
      .filter(isPopularProduct)
      .slice()
      .sort((a, b) => skuNumber((a as Product & { sku?: string }).sku) - skuNumber((b as Product & { sku?: string }).sku));

    // Agrupar resto por categoría
    const groups = new Map<string, Product[]>();
    for (const p of items) {
      if (isPopularProduct(p)) continue;
      const catName = getCategoryNameFromProduct(p);
      const list = groups.get(catName);
      if (list) {
        list.push(p);
      } else {
        groups.set(catName, [p]);
      }
    }

    // Ordenar productos dentro de cada grupo por número de SKU
    for (const [name, arr] of groups.entries()) {
      const sorted = arr.slice().sort(
        (a, b) =>
          skuNumber((a as Product & { sku?: string }).sku) -
          skuNumber((b as Product & { sku?: string }).sku)
      );
      groups.set(name, sorted);
    }

    // Ordenar nombres de categorías por homeOrder; empate por nombre
    const names = Array.from(groups.keys()).sort((a, b) => {
      const aArr = groups.get(a);
      const bArr = groups.get(b);
      const aId = aArr && aArr.length > 0 ? getCategoryIdFromProduct(aArr[0] as Product) : "";
      const bId = bArr && bArr.length > 0 ? getCategoryIdFromProduct(bArr[0] as Product) : "";

      const ao =
        (aId && orderById.has(aId) ? (orderById.get(aId) as number) : undefined) ??
        orderByName.get(a.toLowerCase()) ??
        1000;
      const bo =
        (bId && orderById.has(bId) ? (orderById.get(bId) as number) : undefined) ??
        orderByName.get(b.toLowerCase()) ??
        1000;

      if (ao !== bo) return ao - bo;
      return a.localeCompare(b, "es");
    });

    return {
      popularItems: popular,
      categoryGroups: groups,
      orderedCategoryNames: names,
    };
  }, [items, cats]);

  // Grid reutilizable
  const Grid = ({ products }: { products: Product[] }) => (
    <div className="mt-4 grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {products.map((p) => (
        <ProductCard key={p.id} id={p.id} name={p.name} price={p.price} imageUrl={p.imageUrl} pluses={p.pluses}  puffs={p.puffs} ml={p.ml} className="!p-0" />
      ))}
    </div>
  );

  // Con filtros: ordenar por SKU asc también
  const filteredSorted = useMemo<Product[]>(() => {
    if (!(q || category)) return items;
    return items
      .slice()
      .sort(
        (a, b) =>
          skuNumber((a as Product & { sku?: string }).sku) -
          skuNumber((b as Product & { sku?: string }).sku)
      );
  }, [items, q, category]);

  /* =========================
     Render
     ========================= */
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
      ) : q || category ? (
        <Grid products={filteredSorted} />
      ) : (
        <div className="mt-4 space-y-8">
          {popularItems.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold text-white">Populares</h2>
              <Grid products={popularItems} />
            </section>
          )}

          {/* Cuando cats aún carga, no bloqueamos; solo afecta orden */}
          {(catsLoading ? orderedCategoryNames : orderedCategoryNames).map((cat) => {
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
