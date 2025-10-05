// src/pages/ProductDetailPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams, Link } from "react-router-dom";
import axios from "axios";
import { getProductById } from "../services/products_service";
import type { Product } from "../types/Product";
import { useCart } from "../store/cart_info";
import type { CartItem } from "../types/Cart";

// Helpers
const formatCOP = (cents: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 })
    .format(cents / 100);

type LocationState = { product?: Product };

// Tipos para add-ons
type AddOn = { id: string; name: string; price: number }; // precio en centavos
type ExtraVapeModel = { name: string; basePrice: number };
type GiftVapeModel = { name: string; basePrice: number };

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const state = (location.state as LocationState) ?? {};

  // ✅ hooks SIEMPRE dentro del componente
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | undefined>(state.product);
  const [loading, setLoading] = useState<boolean>(!state.product);
  const [error, setError] = useState<string>("");

  // principal
  const [qty, setQty] = useState<number>(1);
  const [flavor, setFlavor] = useState<string>("");

  // add-ons encadenados
  const [open1, setOpen1] = useState<boolean>(false); // cargador
  const [open2, setOpen2] = useState<boolean>(false); // otro vape
  const [open3, setOpen3] = useState<boolean>(false); // vape de regalo

  const [charger, setCharger] = useState<AddOn | null>(null);
  const [extraVape, setExtraVape] = useState<{ model?: string; flavor?: string; qty?: number; price?: number }>({});
  const [giftVape, setGiftVape] = useState<{ model?: string; flavor?: string }>({});

  const productId = useMemo(() => id ?? "", [id]);

  // Datos estáticos (puedes traerlos de tu API luego)
  const DEFAULT_FLAVORS: string[] = ["Mango", "Ice Mint", "Sandía", "Uva"];
  const chargers: AddOn[] = [
    { id: "usb-c",    name: "Cargador USB-C",        price: 25000 },
    { id: "wall-20w", name: "Cargador de pared 20W", price: 49900 },
  ];
  const extraVapeModels: ExtraVapeModel[] = [
    { name: "Vape Mini 1500", basePrice: 79900 },
    { name: "Vape Pro 5000",  basePrice: 129900 },
  ];
  const giftVapeModels: GiftVapeModel[] = [
    { name: "Vape Classic 1000 (Regalo)", basePrice: 0 },
  ];

  useEffect(() => {
    if (!productId || product) return;

    let active = true;
    (async () => {
      try {
        setLoading(true);
        const p = await getProductById(productId); // Promise<Product>
        if (!active) return;

        setProduct(p);

        // sabores disponibles tomando del producto si viene, o default
        const initialFlavors: string[] =
          Array.isArray(p.flavors) && p.flavors.length > 0 ? p.flavors : DEFAULT_FLAVORS;

        // set default flavor si aún no hay
        setFlavor((prev) => prev || initialFlavors[0]);
      } catch (e: unknown) {
        if (axios.isAxiosError(e)) {
          const status = e.response?.status;
          const msg = (e.response?.data as { error?: string } | undefined)?.error ?? "Error al cargar";
          setError(status === 404 ? "Producto no encontrado" : msg);
        } else if (e instanceof Error) {
          setError(e.message);
        } else {
          setError("Error desconocido");
        }
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [productId, product]); // no usamos DEFAULT_FLAVORS aquí adentro

  if (error) return <p className="p-6 text-red-400">{error}</p>;
  if (loading || !product) {
    return (
      <div className="p-6 text-white">
        <div className="h-6 w-40 mb-4 rounded bg-white/10 animate-pulse" />
        <div className="h-72 w-full max-w-xl rounded-2xl border border-white/10 bg-white/5 animate-pulse" />
        <div className="h-6 w-24 mt-4 rounded bg-white/10 animate-pulse" />
      </div>
    );
  }

  // sabores disponibles (fuera del effect para no romper deps)
  const availableFlavors: string[] =
    Array.isArray(product.flavors) && product.flavors.length > 0 ? product.flavors : DEFAULT_FLAVORS;

  const img = product.imageUrl || product.images?.[0] || "https://picsum.photos/900";
  const inStock = product.stock ?? 0;

  const addOnTotal = (charger?.price ?? 0) + (extraVape.price ?? 0);
  const mainTotal = product.price * qty;
  const grandTotal = mainTotal + addOnTotal;

  const canOpen3 = open2 && !!extraVape.model; // (usamos la condición directamente para el 2)

  // ✅ único addToCart DENTRO del componente
  const addToCart = () => {
    const item: CartItem = {
      id: product.id,
      name: product.name,
      price: product.price, // centavos
      qty,
      flavor,
      imageUrl: product.imageUrl || product.images?.[0],
      charger: charger ? { id: charger.id, name: charger.name, price: charger.price } : null,
      extraVape: extraVape.model
        ? {
            model: extraVape.model,
            flavor: extraVape.flavor,
            qty: extraVape.qty || 1,
            price: extraVape.price || 0,
          }
        : null,
      giftVape: giftVape.model ? { model: giftVape.model, flavor: giftVape.flavor } : null,
    };

    addItem(item);
    alert("Producto agregado al carrito ✅");
  };

  return (
    <div className="p-6 text-white">
      <div className="mb-4">
        <Link to="/" className="text-sm text-green-300 hover:underline">
          ← Volver
        </Link>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* IZQUIERDA: Imagen */}
        <div className="relative overflow-hidden rounded-2xl border border-green-700 bg-black/20">
          <img src={img} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
        </div>

        {/* DERECHA: Información + Formularios */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <div className="mt-2 text-2xl font-bold text-green-400">{formatCOP(product.price)}</div>
            <p className="mt-2 text-white/80">{product.description ?? "—"}</p>
            <div className="mt-2 text-sm text-white/70">
              Stock disponible: <span className="font-semibold">{inStock}</span> unidades
            </div>
          </div>

          {/* Cantidad + Sabor */}
          <div className="rounded-2xl border border-green-700 bg-[#15221d] p-4 space-y-4">
            <div className="flex items-center gap-3">
              <label className="text-sm w-24">Cantidad</label>
              <input
                type="number"
                min={1}
                max={inStock || 99}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Math.min(Number(e.target.value), inStock || 99)))}
                className="w-24 rounded-xl bg-white/10 border border-white/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm w-24">Sabor</label>
              <select
                value={flavor}
                onChange={(e) => setFlavor(e.target.value)}
                className="flex-1 rounded-xl bg-white/10 border border-white/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                {availableFlavors.map((f: string) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ADD-ON 1: Cargador */}
          <div className="rounded-2xl border border-green-700 overflow-hidden">
            <button
              type="button"
              onClick={() => setOpen1((v) => !v)}
              className="w-full text-left px-4 py-3 bg-[#182c25] hover:bg-[#1B3128] flex items-center justify-between"
            >
              <span className="font-semibold">➕ Agregar cargador</span>
              <span className="text-sm text-white/70">{open1 ? "Cerrar" : "Abrir"}</span>
            </button>

            {open1 && (
              <div className="bg-[#15221d] p-4 space-y-3">
                <div className="text-sm text-white/70">Elige un cargador</div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {chargers.map((c: AddOn) => (
                    <label
                      key={c.id}
                      className={`cursor-pointer rounded-xl border px-4 py-3 text-sm 
                                  ${charger?.id === c.id ? "border-green-500 bg-white/10" : "border-white/20 bg-white/5"}`}
                    >
                      <input
                        type="radio"
                        name="charger"
                        className="mr-2 accent-green-500"
                        checked={charger?.id === c.id}
                        onChange={() => setCharger(c)}
                      />
                      {c.name}{" "}
                      <span className="ml-2 text-green-300 font-semibold">{formatCOP(c.price)}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ADD-ON 2: Otro vape (depende del 1) */}
          <div
            className={`rounded-2xl border overflow-hidden ${
              open1 && charger ? "border-green-700" : "border-white/10 opacity-60 pointer-events-none"
            }`}
          >
            <button
              type="button"
              onClick={() => open1 && charger && setOpen2((v) => !v)}
              className="w-full text-left px-4 py-3 bg-[#182c25] hover:bg-[#1B3128] flex items-center justify-between"
            >
              <span className="font-semibold">➕ Agregar otro vape</span>
              <span className="text-sm text-white/70">{open2 ? "Cerrar" : "Abrir"}</span>
            </button>

            {open2 && open1 && charger && (
              <div className="bg-[#15221d] p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <label className="text-sm w-24">Modelo</label>
                  <select
                    className="flex-1 rounded-xl bg-white/10 border border-white/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    value={extraVape.model ?? ""}
                    onChange={(e) => {
                      const model = extraVapeModels.find((m: ExtraVapeModel) => m.name === e.target.value);
                      setExtraVape((prev) => ({ ...prev, model: model?.name, price: model?.basePrice ?? 0 }));
                    }}
                  >
                    <option value="" disabled>
                      Selecciona…
                    </option>
                    {extraVapeModels.map((m: ExtraVapeModel) => (
                      <option key={m.name} value={m.name}>
                        {m.name} ({formatCOP(m.basePrice)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-sm w-24">Sabor</label>
                  <select
                    className="flex-1 rounded-xl bg-white/10 border border-white/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    value={extraVape.flavor ?? ""}
                    onChange={(e) => setExtraVape((prev) => ({ ...prev, flavor: e.target.value }))}
                  >
                    <option value="" disabled>
                      Selecciona…
                    </option>
                    {availableFlavors.map((f: string) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-sm w-24">Cantidad</label>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={extraVape.qty ?? 1}
                    onChange={(e) =>
                      setExtraVape((prev) => ({ ...prev, qty: Math.max(1, Number(e.target.value)) }))
                    }
                    className="w-24 rounded-xl bg-white/10 border border-white/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>
              </div>
            )}
          </div>

          {/* ADD-ON 3: Regalo (depende del 2) */}
          <div
            className={`rounded-2xl border overflow-hidden ${
              canOpen3 ? "border-green-700" : "border-white/10 opacity-60 pointer-events-none"
            }`}
          >
            <button
              type="button"
              onClick={() => canOpen3 && setOpen3((v) => !v)}
              className="w-full text-left px-4 py-3 bg-[#182c25] hover:bg-[#1B3128] flex items-center justify-between"
            >
              <span className="font-semibold">🎁 Vape de regalo</span>
              <span className="text-sm text-white/70">{open3 ? "Cerrar" : "Abrir"}</span>
            </button>

            {open3 && canOpen3 && (
              <div className="bg-[#15221d] p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <label className="text-sm w-24">Modelo</label>
                  <select
                    className="flex-1 rounded-xl bg-white/10 border border-white/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    value={giftVape.model ?? ""}
                    onChange={(e) => setGiftVape((prev) => ({ ...prev, model: e.target.value }))}
                  >
                    <option value="" disabled>
                      Selecciona…
                    </option>
                    {giftVapeModels.map((m: GiftVapeModel) => (
                      <option key={m.name} value={m.name}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-sm w-24">Sabor</label>
                  <select
                    className="flex-1 rounded-xl bg-white/10 border border-white/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    value={giftVape.flavor ?? ""}
                    onChange={(e) => setGiftVape((prev) => ({ ...prev, flavor: e.target.value }))}
                  >
                    <option value="" disabled>
                      Selecciona…
                    </option>
                    {availableFlavors.map((f: string) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>

                <p className="text-sm text-green-300">Este ítem es gratis como promoción.</p>
              </div>
            )}
          </div>

          {/* RESUMEN + CTA */}
          <div className="flex items-center justify-between rounded-2xl border border-green-700 bg-[#182c25] px-4 py-3">
            <div className="text-sm">
              <div>
                Total producto: <span className="font-semibold">{formatCOP(mainTotal)}</span>
              </div>
              <div>
                Extras: <span className="font-semibold">{formatCOP(addOnTotal)}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-green-300">Total: {formatCOP(grandTotal)}</div>
              <button
                onClick={addToCart}
                className="mt-2 rounded-xl bg-green-500 px-5 py-2 text-sm font-semibold text-black hover:bg-green-400"
              >
                Agregar al carrito
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
