// src/pages/ProductDetailPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams, Link } from "react-router-dom";
import { getProductById } from "../services/products_service";
import type { Product } from "../types/Product";
import { useCart } from "../store/cart_info";
import type { CartItem } from "../types/Cart";
import { optimizeImage } from "../utils/cloudinary";

/* ==== Helpers ==== */
const formatCOP = (pesos: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(pesos || 0);

type LocationState = { product?: Product };

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const state = (location.state as LocationState) ?? {};
  const { addItem, setOpen } = useCart();

  /* ==== Dropshipping ==== */
  const isDropshipping = useCart((state) => state.isDropshipping);

  /* ==== Descuento recibido desde DailyPromotion ==== */
  const searchParams = new URLSearchParams(location.search);
  const discount = Number(searchParams.get("discount") ?? 0);
  const overridePrice = Number(searchParams.get("finalPrice") ?? 0);

  /* ==== Producto ==== */
  const [product, setProduct] = useState<Product | undefined>(state.product);
  const [loading, setLoading] = useState<boolean>(!state.product);
  const [error, ] = useState<string>("");

  const [qty, setQty] = useState<number>(1);
  const [flavor, setFlavor] = useState<string>("");

  const productId = useMemo(() => id ?? "", [id]);
  const DEFAULT_FLAVORS = useMemo(() => ["Mango", "Ice Mint", "Sandía", "Uva"], []);

  /* ==== Precio base con descuento ==== */
  const basePrice = useMemo(() => {
    if (!product) return 0;
    if (discount > 0 && overridePrice > 0) return overridePrice;
    if (isDropshipping && (product.dropshipperPrice ?? 0) > 0) {
      return product.dropshipperPrice as number;
    }
    return product.price;
  }, [product, discount, overridePrice, isDropshipping]);

  /* ==== Cargar producto si no viene desde state ==== */
  useEffect(() => {
    if (!productId || product) return;

    let active = true;
    (async () => {
      try {
        setLoading(true);
        const p = await getProductById(productId);
        if (!active) return;

        const usesFlavors = p.hasFlavors ?? (p.flavors?.length ?? 0) > 0;
        setProduct(p);

        if (usesFlavors) {
          const initialFlavors = Array.isArray(p.flavors) && p.flavors.length > 0
              ? p.flavors
              : DEFAULT_FLAVORS;
          setFlavor((prev) => prev || initialFlavors[0]);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [productId, product, DEFAULT_FLAVORS]);

  if (error) return <p className="p-6 text-red-400">{error}</p>;

  if (loading || !product) return (
      <div className="p-6 text-zinc-100">
        <div className="h-6 w-40 mb-4 rounded bg-zinc-800/60 animate-pulse" />
        <div className="h-72 w-full max-w-xl rounded-2xl border border-stone-700 bg-[#111315] animate-pulse" />
      </div>
  );

  const usesFlavors = product.hasFlavors ?? (product.flavors?.length ?? 0) > 0;
  const availableFlavors = usesFlavors
    ? (Array.isArray(product.flavors) && product.flavors.length > 0 ? product.flavors : DEFAULT_FLAVORS)
    : [];

  const img = optimizeImage(product.imageUrl || product.images?.[0] || "https://picsum.photos/900", 1000);
  const inStock = product.stock ?? 0;
  const grandTotal = basePrice * qty;

  const addToCart = (): void => {
    const item: CartItem = {
      id: product.id,
      name: product.name,
      price: basePrice,
      qty,
      flavor: usesFlavors ? flavor : "",
      imageUrl: product.imageUrl || product.images?.[0],
      charger: null,
      extraVape: null, // Limpiado
      giftVape: null,  // Limpiado
    };
    addItem(item);
    setOpen(true);
  };

  return (
    <div className="p-6 text-zinc-100">
      <div className="mb-4">
        <Link to="/" className="text-sm text-amber-400 hover:underline">← Volver</Link>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Imagen */}
        <div className="relative overflow-hidden rounded-2xl border border-stone-700 bg-[#111315]">
          <img src={img} alt={product.name} className="w-full h-full object-cover" />
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            
            {discount > 0 ? (
              <>
                <div className="text-zinc-400 line-through">{formatCOP(product.price)}</div>
                <div className="mt-1 text-2xl font-bold text-green-400">{formatCOP(basePrice)}</div>
              </>
            ) : (
              <div className="mt-2 text-2xl font-bold text-amber-400">
                {formatCOP(basePrice)}
                {isDropshipping && (
                  <span className="ml-2 text-[10px] text-emerald-500 uppercase bg-emerald-500/10 px-2 py-1 rounded">
                    DR
                  </span>
                )}
              </div>
            )}

            <p className="mt-2 text-zinc-300">{product.description ?? "—"}</p>
            <div className="mt-2 text-sm text-zinc-400">Stock: <span className="text-zinc-200">{inStock}</span></div>
          </div>

          {/* Controles */}
          <div className="rounded-2xl border border-stone-700 bg-[#111315] p-4 space-y-4">
            <div className="flex items-center gap-3">
              <label className="text-sm w-24 text-zinc-300">Cantidad</label>
              <input
                type="number"
                min={1}
                max={inStock || 99}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Math.min(Number(e.target.value), inStock || 99)))}
                className="w-24 rounded-xl bg-zinc-900 border border-stone-700 px-3 py-2 text-sm"
              />
            </div>

            {availableFlavors.length > 0 && (
              <div className="flex items-center gap-3">
                <label className="text-sm w-24 text-zinc-300">Sabor</label>
                <select
                  value={flavor}
                  onChange={(e) => setFlavor(e.target.value)}
                  className="flex-1 rounded-xl bg-zinc-900 border border-stone-700 px-3 py-2 text-sm"
                >
                  {availableFlavors.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Botón Final */}
          <div className="flex items-center justify-between rounded-2xl border border-stone-700 bg-[#1a1d1f] px-4 py-3">
            <div className="text-lg font-bold text-amber-400">
              Total: {formatCOP(grandTotal)}
            </div>
            <button
              onClick={addToCart}
              className="rounded-xl bg-amber-400 px-5 py-2 text-sm font-semibold text-black hover:bg-amber-300"
            >
              Agregar al carrito
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}