// src/views/HomeView.tsx
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getProducts } from "../services/products_service";
import type { Product } from "../types/Product"; 
import ProductCard from "../components/ProductCard";
import Container from "../components/Container";
import DailyPromotion from "../components/DailyPromotion";
import { getBanner } from "../services/admin";
import {
  type BannerWeek,
  type BannerDay
} from "../services/banner_services";

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

  if (isRecord(p) && typeof (p as Record<string, unknown>)["categoryName"] === "string") {
    return (p as Record<string, unknown>)["categoryName"] as string;
  }

  return "Otros";
}

/** Lee el id de categoría si el backend lo envía; si no, cadena vacía. */
function getCategoryIdFromProduct(p: Product): string {
  if (p.categoryId) {
    return p.categoryId;
  }
  return "";
}

/** Producto visible: usa visible o isActive; por defecto true. */
function isVisibleProduct(p: Product): boolean {
  if (hasBooleanKey(p, "visible")) return p["visible"];
  if (hasBooleanKey(p, "isActive")) return p["isActive"];
  return true;
}

/* =========================
   Tipos locales
   ========================= */

type PublicCategory = {
  id: string;
  name: string;
  homeOrder?: number;
  imageUrl?: string;
};

// Nuevo tipo para el resultado agrupado
type GroupedCategory = PublicCategory & {
    products: Product[];
};

/* =========================
   API pública de categorías
   ========================= */

async function fetchPublicCategories(): Promise<PublicCategory[]> {
  const base =
    (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:8080/api";
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
  // Indica que puede ser BannerWeek O null
  const [banner, setBanner] = useState<BannerWeek | null>(null);
  const q = params.get("q") || undefined;
  const category = params.get("category") || undefined;

  

  // Cargar banner
    useEffect(() => {
    (async () => {
      try {
        const data = await getBanner();
        setBanner(data);
      } catch (e) {
        console.error("Error cargando banner", e);
      }
    })();
  }, []);

  // Cargar productos
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setError("");
        setLoading(true);
        const filters = { q: q, category: category };
        const cleanedFilters = (q || category) 
            ? Object.fromEntries(
                Object.entries(filters).filter(([, value]) => value !== undefined)
              )
            : undefined;
        
        const data = await getProducts(cleanedFilters);
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

  // Cargar categorías
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setCatsLoading(true);
        const data = await fetchPublicCategories();
        if (alive) setCats(data);
      } catch (e) {
        console.error("Error al obtener categorías:", e);
      } finally {
        if (alive) setCatsLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

 // 1. Tipo para los días del banner
type BannerDays = keyof BannerWeek;

// 2. Obtener el día actual ("Lunes", "Martes", etc.)
const todayCapitalized = new Date()
  .toLocaleDateString("es-CO", { weekday: "long" })
  .replace(/^\w/, c => c.toUpperCase()) as BannerDays;

// 3. Forzar a TS a entender el tipo correcto
const todayBanner: BannerDay | null =
  banner?.[todayCapitalized] ?? null;

// 4. Producto del día con validación segura
const promoProduct = useMemo(() => {
  if (!todayBanner || !todayBanner.vapeId) return null;

  return items.find(p => p.id === todayBanner.vapeId
  ) ?? null;
}, [todayBanner, items]);


  // Grid reutilizable
  const Grid = ({ products }: { products: Product[] }) => (
    <div className="mt-4 grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {products.map((p) => (
        <ProductCard
          key={p.id}
          id={p.id}
          name={p.name}
          price={p.price}
          imageUrl={p.imageUrl ?? (p.images && p.images.length > 0 ? p.images[0] : undefined)}
          // 🚨 CORRECCIÓN LINTER: Se añade la descripción para la regla @ts-expect-error
          // La propiedad 'brand' no existe en la interfaz 'Product', se asume que existe para ProductCard.
          // @ts-expect-error Propiedad 'brand' no existe en la interfaz 'Product', se asume que existe para ProductCard.
          brand={p.brand} 
          categoryName={getCategoryNameFromProduct(p)}
          pluses={p.pluses}
          puffs={p.puffs}
          ml={p.ml}
          className="!p-0"
        />
      ))}
    </div>
  );

  // Lista filtrada cuando hay búsqueda o query param de categoría (sin cambios)
  const filteredSorted = useMemo<Product[]>(() => {
    if (!(q || category)) return items;
    const base = items.slice();
    const filtered = base.filter((p) => {
      if (category && getCategoryIdFromProduct(p) !== category) return false;
      if (!q) return true;
      const qLower = q.toLowerCase();
      const name = p.name?.toString().toLowerCase() ?? "";
      const brand = (p as Product & { brand?: string }).brand?.toString().toLowerCase() ?? ""; 
      const sku = (p as Product & { sku?: string }).sku?.toString().toLowerCase() ?? "";
      return name.includes(qLower) || brand.includes(qLower) || sku.includes(qLower);
    });
    return filtered.sort(
      (a, b) =>
        skuNumber((a as Product & { sku?: string }).sku) -
        skuNumber((b as Product & { sku?: string }).sku)
    );
  }, [items, q, category]);


  // 🚨 LÓGICA MODIFICADA: Agrupar productos por categoría y separarlas en principal y secundarias
  const { mainCategoryGroup, secondaryCategoriesGroup } = useMemo(() => {
    // 1. Agrupar productos por categoryId
    const productsByCatId = items.reduce(
        (acc, p) => {
            const catId = getCategoryIdFromProduct(p) || "otros";
            acc[catId] = acc[catId] || [];
            acc[catId].push(p);
            return acc;
        },
        {} as Record<string, Product[]>
    );

    // 2. Ordenar todas las categorías por homeOrder (asc)
    const orderedCats = cats.slice().sort((a, b) => {
        const orderA = a.homeOrder ?? 1000;
        const orderB = b.homeOrder ?? 1000;
        return orderA - orderB;
    });

    let mainCategoryGroup: GroupedCategory | undefined;
    const secondaryCategoriesGroup: GroupedCategory[] = [];

    // 3. Mapear y separar en principal (homeOrder: 1) y secundarias (homeOrder > 1)
    orderedCats
        .map((cat) => ({
            ...cat,
            products: (productsByCatId[cat.id] || []).sort(
                // Aplicar orden por SKU a los productos de cada grupo
                (a, b) =>
                    skuNumber((a as Product & { sku?: string }).sku) -
                    skuNumber((b as Product & { sku?: string }).sku)
            ),
        }))
        .filter((c) => c.products.length > 0) // Solo categorías con productos
        .forEach((catGroup) => {
            if (catGroup.homeOrder === 1 && !mainCategoryGroup) {
                mainCategoryGroup = catGroup;
            } else {
                secondaryCategoriesGroup.push(catGroup);
            }
        });

    return { mainCategoryGroup, secondaryCategoriesGroup };
  }, [items, cats]);

  // Creamos una lista única de categorías para las tarjetas de navegación
  const allCategoriesForCards = useMemo(() => {
      return [
          ...(mainCategoryGroup ? [mainCategoryGroup] : []),
          ...secondaryCategoriesGroup
      ];
  }, [mainCategoryGroup, secondaryCategoriesGroup]);
  

  /* =========================
   Render
   ========================= */
  return (
    <Container>
        <div className="mb-10">
        {promoProduct ? (
          <DailyPromotion
            productId={promoProduct.id}
            productName={promoProduct.name}
            imageUrl={
              todayBanner?.bannerImageUrl ?? // 1. Usar la imagen de banner dedicada si existe
              promoProduct.imageUrl ?? // 2. Fallback: Usar la URL principal del producto
              promoProduct.images?.[0] ?? // 3. Fallback: Usar la primera imagen de la lista
              "https://placehold.co/1600x500/000000/FFFFFF?text=Sin+imagen" // 4. Fallback final
          }
          />
        ) : (
          // Opcional: un mensaje mientras carga o si no hay promo
          <p className="text-white/60">No hay promoción para hoy.</p>
        )}
      </div>


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
      ) : items.length === 0 && (q || category) ? (
        <p className="mt-6 text-white/60">
          No encontramos productos con esos filtros.
        </p>
      ) : (q || category) ? (
        // Vista cuando hay búsqueda o se pasa ?category=...
        <>
            <h2 className="text-2xl font-semibold text-white mt-4">
                {q ? `Resultados para "${q}"` : `Productos en Categoría ${cats.find(c => c.id === category)?.name ?? category}`}
            </h2>
            <Grid products={filteredSorted} />
        </>
      ) : (
        // Vista principal del home (con la categoría principal, luego las tarjetas y luego las secundarias)
        <div className="mt-4 space-y-8">


            {/* 1. TARJETAS DE NAVEGACIÓN A LAS CATEGORÍAS (MOVIDAS ARRIBA) */}
        <section className="mb-8 space-y-4"> {/* 🚀 CAMBIO: Agregado margin-bottom para separarlo del contenido de abajo */}
          <h2 className="text-2xl font-semibold text-white">
            Explora por categoría
          </h2>

          {catsLoading && (
            <p className="text-sm text-white/60">Cargando categorías…</p>
          )}

          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
            {allCategoriesForCards.map((cat) => (
              <a
                key={cat.id}
                href={`#cat-${cat.id}`} 
                // ... el resto de la clase permanece igual
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/90 p-0 transition hover:scale-[1.02] hover:border-white/40"                onClick={(e) => {
                  e.preventDefault(); 
                  document.getElementById(`cat-${cat.id}`)?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }}
              >
                
                {/* 🚀 AÑADIR: La imagen como fondo semi-transparente */}
                {cat.imageUrl && (
                  <img
                  src={cat.imageUrl}
                  alt={cat.name} // Importante para accesibilidad
                  // Estilos: Ocupa el 100%, mantiene la relación rectangular (4/3)
                  className="w-full h-full object-cover transition duration-300 group-hover:scale-105 rounded-2xl" 
                  style={{ aspectRatio: '4/3' }} 
                />
                )}
              </a>
            ))}
          </div>
        </section>
          
          {/* 1. SECCIÓN PRINCIPAL (homeOrder: 1) */}
          {mainCategoryGroup && mainCategoryGroup.products.length > 0 && (
            <section key={mainCategoryGroup.id} id={`cat-${mainCategoryGroup.id}`}> 
              <h2 className="text-2xl font-semibold text-white">
                {mainCategoryGroup.name}
              </h2>
              <Grid products={mainCategoryGroup.products} />
            </section>
          )}

         
          {/* 3. SECCIONES SECUNDARIAS (homeOrder > 1) - Ordenadas por homeOrder */}
          {secondaryCategoriesGroup.map((cat) => (
            <section key={cat.id} id={`cat-${cat.id}`}> 
              <h2 className="text-2xl font-semibold text-white">
                {cat.name}
              </h2>
              <Grid products={cat.products} />
            </section>
          ))}
        </div>
      )}
    </Container>
  );
}