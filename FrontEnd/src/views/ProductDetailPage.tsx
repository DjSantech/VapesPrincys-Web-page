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
type AddOn = { id: string; name: string; price: number };
type ExtraVapeModel = { name: string; basePrice: number };
type GiftVapeModel = { name: string; basePrice: number };

// 1) Pequeño componente reutilizable (opcional)
function StepNotice({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-4 py-2 text-xs rounded-b-xl bg-[#0d0f10] text-zinc-300 border-t border-stone-800">
      {children}
    </p>
  );
}


export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const state = (location.state as LocationState) ?? {};

  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | undefined>(state.product);
  const [loading, setLoading] = useState<boolean>(!state.product);
  const [error, setError] = useState<string>("");

  // principal
  const [qty, setQty] = useState<number>(1);
  const [flavor, setFlavor] = useState<string>("");

  // add-ons encadenados
  const [open1, setOpen1] = useState<boolean>(false);
  const [open2, setOpen2] = useState<boolean>(false);
  const [open3, setOpen3] = useState<boolean>(false);

  const [charger, setCharger] = useState<AddOn | null>(null);
  const [extraVape, setExtraVape] = useState<{ model?: string; flavor?: string; qty?: number; price?: number }>({});
  const [giftVape, setGiftVape] = useState<{ model?: string; flavor?: string }>({});

  const productId = useMemo(() => id ?? "", [id]);

  // Datos estáticos
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
        const p = await getProductById(productId);
        if (!active) return;

        setProduct(p);

        const initialFlavors: string[] =
          Array.isArray(p.flavors) && p.flavors.length > 0 ? p.flavors : DEFAULT_FLAVORS;

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
  }, [productId, product]);

  if (error) return <p className="p-6 text-red-400">{error}</p>;
  if (loading || !product) {
    return (
      <div className="p-6 text-zinc-100">
        <div className="h-6 w-40 mb-4 rounded bg-zinc-800/60 animate-pulse" />
        <div className="h-72 w-full max-w-xl rounded-2xl border border-stone-700 bg-[#111315] animate-pulse" />
        <div className="h-6 w-24 mt-4 rounded bg-zinc-800/60 animate-pulse" />
      </div>
    );
  }

  const availableFlavors: string[] =
    Array.isArray(product.flavors) && product.flavors.length > 0 ? product.flavors : DEFAULT_FLAVORS;

  const img = product.imageUrl || product.images?.[0] || "https://picsum.photos/900";
  const inStock = product.stock ?? 0;

  const addOnTotal = (charger?.price ?? 0) + (extraVape.price ?? 0);
  const mainTotal = product.price * qty;
  const grandTotal = mainTotal + addOnTotal;

  const canOpen3 = open2 && !!extraVape.model;

  const addToCart = () => {
    const item: CartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
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
    <div className="p-6 text-zinc-100">
      <div className="mb-4">
        <Link to="/" className="text-sm text-amber-400 hover:underline">
          ← Volver
        </Link>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* IZQUIERDA: Imagen */}
        <div className="relative overflow-hidden rounded-2xl border border-stone-700 bg-[#111315]">
          <img src={img} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
        </div>

        {/* DERECHA */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-zinc-100">{product.name}</h1>
            <div className="mt-2 text-2xl font-bold text-amber-400">{formatCOP(product.price)}</div>
            <p className="mt-2 text-zinc-300">{product.description ?? "—"}</p>
            <div className="mt-2 text-sm text-zinc-400">
              Stock disponible: <span className="font-semibold text-zinc-200">{inStock}</span> unidades
            </div>
          </div>

          {/* Cantidad + Sabor */}
          <div className="rounded-2xl border border-stone-700 bg-[#111315] p-4 space-y-4">
            <div className="flex items-center gap-3">
              <label className="text-sm w-24 text-zinc-300">Cantidad</label>
              <input
                type="number"
                min={1}
                max={inStock || 99}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Math.min(Number(e.target.value), inStock || 99)))}
                className="w-24 rounded-xl bg-zinc-900 border border-stone-700 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm w-24 text-zinc-300">Sabor</label>
              <select
                value={flavor}
                onChange={(e) => setFlavor(e.target.value)}
                className="flex-1 rounded-xl bg-zinc-900 border border-stone-700 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                {availableFlavors.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ADD-ON 1: Cargador */}
          <div className="rounded-2xl border border-stone-700 overflow-hidden">
            <button
              type="button"
              onClick={() => setOpen1((v) => !v)}
              className="w-full text-left px-4 py-3 bg-[#1a1d1f] hover:bg-[#181b1d] flex items-center justify-between"
            >
              <span className="font-semibold text-zinc-100">➕ Agregar cargador</span>
              <span className="text-sm text-zinc-400">{open1 ? "Cerrar" : "Abrir"}</span>
            </button>

            {open1 && (
              <div className="bg-[#111315] p-4 space-y-3">
                <div className="text-sm text-zinc-400">Elige un cargador</div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {chargers.map((c) => (
                    <label
                      key={c.id}
                      className={`cursor-pointer rounded-xl border px-4 py-3 text-sm
                        ${charger?.id === c.id ? "border-amber-400 bg-zinc-900" : "border-stone-700 bg-[#0d0f10]"}`}
                    >
                      <input
                        type="radio"
                        name="charger"
                        className="mr-2 accent-amber-400"
                        checked={charger?.id === c.id}
                        onChange={() => setCharger(c)}
                      />
                      <span className="text-zinc-200">{c.name}</span>
                      <span className="ml-2 text-amber-400 font-semibold">{formatCOP(c.price)}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ADD-ON 2: Otro vape */}
          <div
            className={`rounded-2xl border overflow-hidden ${
              open1 && charger ? "border-stone-700" : "border-stone-800 opacity-60 pointer-events-none"
            }`}
          >
            <button
                type="button"
                onClick={() => open1 && charger && setOpen2((v) => !v)}
                className="w-full text-left px-4 py-3 bg-[#1a1d1f] hover:bg-[#181b1d] flex items-center justify-between"
                aria-disabled={!open1 || !charger}
                title={!open1 || !charger ? "Primero abre 'Agregar cargador' y elige uno" : undefined}
              >
              <span className="font-semibold text-zinc-100">➕ Agregar otro vape</span>
              <span className="text-sm text-zinc-400">{open2 ? "Cerrar" : "Abrir"}</span>
            </button>

            {/* AVISO cuando está bloqueado */}
            {(!open1 || !charger) && (
              <StepNotice>
                Para habilitar este paso, primero abre <span className="font-semibold">“Agregar cargador”</span> y elige uno.
              </StepNotice>
            )}

            {open2 && open1 && charger && (
              <div className="bg-[#111315] p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <label className="text-sm w-24 text-zinc-300">Modelo</label>
                  <select
                    className="flex-1 rounded-xl bg-zinc-900 border border-stone-700 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    value={extraVape.model ?? ""}
                    onChange={(e) => {
                      const model = extraVapeModels.find((m) => m.name === e.target.value);
                      setExtraVape((prev) => ({ ...prev, model: model?.name, price: model?.basePrice ?? 0 }));
                    }}
                  >
                    <option value="" disabled>Selecciona…</option>
                    {extraVapeModels.map((m) => (
                      <option key={m.name} value={m.name}>
                        {m.name} ({formatCOP(m.basePrice)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-sm w-24 text-zinc-300">Sabor</label>
                  <select
                    className="flex-1 rounded-xl bg-zinc-900 border border-stone-700 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    value={extraVape.flavor ?? ""}
                    onChange={(e) => setExtraVape((prev) => ({ ...prev, flavor: e.target.value }))}
                  >
                    <option value="" disabled>Selecciona…</option>
                    {availableFlavors.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-sm w-24 text-zinc-300">Cantidad</label>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={extraVape.qty ?? 1}
                    onChange={(e) => setExtraVape((prev) => ({ ...prev, qty: Math.max(1, Number(e.target.value)) }))}
                    className="w-24 rounded-xl bg-zinc-900 border border-stone-700 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>
            )}
          </div>

          {/* ADD-ON 3: Regalo */}
          <div
            className={`rounded-2xl border overflow-hidden ${
              canOpen3 ? "border-stone-700" : "border-stone-800 opacity-60 pointer-events-none"
            }`}
          >
            <button
              type="button"
              onClick={() => canOpen3 && setOpen3((v) => !v)}
              className="w-full text-left px-4 py-3 bg-[#1a1d1f] hover:bg-[#181b1d] flex items-center justify-between"
            >
              <span className="font-semibold text-zinc-100">🎁 Vape de regalo</span>
              <span className="text-sm text-zinc-400">{open3 ? "Cerrar" : "Abrir"}</span>
            </button>
             {/* AVISO cuando está bloqueado */}
              {!canOpen3 && (
                <StepNotice>
                  Este paso se habilita al elegir un modelo en <span className="font-semibold">“Agregar otro vape”</span>.
                </StepNotice>
              )}

            {open3 && canOpen3 && (
              <div className="bg-[#111315] p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <label className="text-sm w-24 text-zinc-300">Modelo</label>
                  <select
                    className="flex-1 rounded-xl bg-zinc-900 border border-stone-700 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    value={giftVape.model ?? ""}
                    onChange={(e) => setGiftVape((prev) => ({ ...prev, model: e.target.value }))}
                  >
                    <option value="" disabled>Selecciona…</option>
                    {giftVapeModels.map((m) => (
                      <option key={m.name} value={m.name}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-sm w-24 text-zinc-300">Sabor</label>
                  <select
                    className="flex-1 rounded-xl bg-zinc-900 border border-stone-700 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    value={giftVape.flavor ?? ""}
                    onChange={(e) => setGiftVape((prev) => ({ ...prev, flavor: e.target.value }))}
                  >
                    <option value="" disabled>Selecciona…</option>
                    {availableFlavors.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                  
                </div>

                <p className="text-sm text-amber-400">Este ítem es gratis como promoción.</p>
              </div>
            )}
          </div>
          
          {/* RESUMEN + CTA */}
          <div className="flex items-center justify-between rounded-2xl border border-stone-700 bg-[#1a1d1f] px-4 py-3">
            <div className="text-sm text-zinc-300">
              <div>
                Total producto: <span className="font-semibold text-zinc-100">{formatCOP(mainTotal)}</span>
              </div>
              <div>
                Extras: <span className="font-semibold text-zinc-100">{formatCOP(addOnTotal)}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-amber-400">Total: {formatCOP(grandTotal)}</div>
              <button
                onClick={addToCart}
                className="mt-2 rounded-xl bg-amber-400 px-5 py-2 text-sm font-semibold text-black hover:bg-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
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
