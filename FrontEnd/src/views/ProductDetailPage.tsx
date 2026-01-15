// src/pages/ProductDetailPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams, Link } from "react-router-dom";
import axios, { AxiosError } from "axios";
import { getProductById } from "../services/products_service";
import type { Product } from "../types/Product";
import { useCart } from "../store/cart_info";
import type { CartItem } from "../types/Cart";
import { optimizeImage } from "../utils/cloudinary"; // ✅ Importación lista

/* ==== Helpers ==== */
const formatCOP = (pesos: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(pesos || 0);

type LocationState = { product?: Product };

type GiftVapeModel = { name: string; basePrice: number };

type Category = { id: string; name: string; slug?: string };
type ProductWithMongoId = Product & { _id?: string };

type ExtraVapeState = {
  model?: string;
  flavor?: string;
  qty?: number;
  price?: number;
};

type GiftVapeState = {
  model?: string;
  flavor?: string;
};

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
  const { addItem, setOpen } = useCart();

  /* ==== Descuento recibido desde DailyPromotion ==== */
  const searchParams = new URLSearchParams(location.search);
  const discount = Number(searchParams.get("discount") ?? 0);
  const overridePrice = Number(searchParams.get("finalPrice") ?? 0);

  /* ==== Producto ==== */
  const [product, setProduct] = useState<Product | undefined>(state.product);
  const [loading, setLoading] = useState<boolean>(!state.product);
  const [error, setError] = useState<string>("");

  const [qty, setQty] = useState<number>(1);
  const [flavor, setFlavor] = useState<string>("");

  const [open2, setOpen2] = useState<boolean>(false);
  const [open3, setOpen3] = useState<boolean>(false);

  const [extraVape, setExtraVape] = useState<ExtraVapeState>({});
  const [giftVape, setGiftVape] = useState<GiftVapeState>({});

  const productId = useMemo(() => id ?? "", [id]);

  const DEFAULT_FLAVORS = useMemo(() => ["Mango", "Ice Mint", "Sandía", "Uva"], []);
  const giftVapeModels: GiftVapeModel[] = [
    { name: "Vape Classic 1000 (Regalo)", basePrice: 0 },
  ];


  

  /* ==== Categorías ==== */
  const baseURL: string =
    (import.meta.env.VITE_API_URL as string) || "/api";

  const [categories, setCategories] = useState<Category[]>([]);
  const [catLoading, setCatLoading] = useState<boolean>(false);
  const [catError, setCatError] = useState<string>("");

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [modelsByCategory, setModelsByCategory] = useState<
    ProductWithMongoId[]
  >([]);
  const [modelsLoading, setModelsLoading] = useState<boolean>(false);
  const [modelsError, setModelsError] = useState<string>("");

  const [selectedModelId, setSelectedModelId] = useState<string>("");
  const [selectedModelFlavors, setSelectedModelFlavors] = useState<string[]>(
    []
  );
  const [selectedModelHasFlavors, setSelectedModelHasFlavors] =
    useState<boolean>(false);

  const getProductKey = (p: ProductWithMongoId): string =>
    p.id || p._id || "";

  /* ==== Cargar producto si no viene desde state ==== */
  useEffect(() => {
    if (!productId || product) return;

    let active = true;
    (async () => {
      try {
        setLoading(true);
        const p = await getProductById(productId);
        if (!active) return;

        const usesFlavors =
          p.hasFlavors ?? (p.flavors?.length ?? 0) > 0;

        setProduct(p);

        if (usesFlavors) {
          const initialFlavors =
            Array.isArray(p.flavors) && p.flavors.length > 0
              ? p.flavors
              : DEFAULT_FLAVORS;
          setFlavor(
            (prev) => prev || initialFlavors[0]
          );
        } else {
          setFlavor("");
        }
      } catch (e: unknown) {
        if (axios.isAxiosError(e)) {
          const status = e.response?.status;
          const msg =
            (
              e.response?.data as { error?: string } | undefined
            )?.error ?? "Error al cargar";
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

  const basePrice = useMemo(() => {
  if (!product) return 0; // Maneja el caso de que sea undefined aquí adentro
  return discount > 0 && overridePrice > 0 ? overridePrice : product.price;
  }, [product, discount, overridePrice]);

  /* ==== Cargar categorías ==== */
  useEffect(() => {
    if (!open2 || categories.length > 0) return;

    let active = true;
    (async () => {
      try {
        setCatLoading(true);
        const { data } = await axios.get<Category[]>(
          `${baseURL}/categories`
        );
        if (!active) return;
        setCategories(Array.isArray(data) ? data : []);
      } catch (e: unknown) {
        const err = e as AxiosError<{ error?: string }>;
        setCatError(
          err.response?.data?.error ??
            "No se pudieron cargar las categorías"
        );
      } finally {
        if (active) setCatLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [open2, categories.length, baseURL]);

  /* ==== Cargar modelos por categoría ==== */
  useEffect(() => {
    if (!selectedCategoryId) return;

    let active = true;
    (async () => {
      try {
        setModelsLoading(true);
        setModelsError("");
        setModelsByCategory([]);
        setSelectedModelId("");
        setSelectedModelFlavors([]);
        setSelectedModelHasFlavors(false);

        setExtraVape((prev) => ({
          ...prev,
          model: undefined,
          flavor: undefined,
          qty: prev.qty ?? 1,
          price: undefined,
        }));

        const { data } = await axios.get<ProductWithMongoId[]>(
          `${baseURL}/products`,
          { params: { categoryId: selectedCategoryId } }
        );

        if (!active) return;
        setModelsByCategory(Array.isArray(data) ? data : []);
      } catch (e: unknown) {
        const err = e as AxiosError<{ error?: string }>;
        setModelsError(
          err.response?.data?.error ??
            "No se pudieron cargar los productos"
        );
      } finally {
        if (active) setModelsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [selectedCategoryId, baseURL]);

  /* ==== Elegir modelo ==== */
  useEffect(() => {
    if (!selectedModelId) return;

    const chosen = modelsByCategory.find(
      (p) => getProductKey(p) === selectedModelId
    );

    const modelHasFlavors =
      chosen?.hasFlavors ?? (chosen?.flavors?.length ?? 0) > 0;

    setSelectedModelHasFlavors(modelHasFlavors);

    const flavors = modelHasFlavors
      ? chosen?.flavors && chosen.flavors.length > 0
        ? chosen.flavors
        : DEFAULT_FLAVORS
      : [];

    setSelectedModelFlavors(flavors);

    setExtraVape({
      model: chosen?.name,
      flavor: modelHasFlavors ? flavors[0] : undefined,
      qty: 1,
      price: chosen?.price ?? 0,
    });
  }, [selectedModelId, modelsByCategory]);

  /* ==== Loading & Error ==== */
  if (error)
    return <p className="p-6 text-red-400">{error}</p>;

  if (loading || !product)
    return (
      <div className="p-6 text-zinc-100">
        <div className="h-6 w-40 mb-4 rounded bg-zinc-800/60 animate-pulse" />
        <div className="h-72 w-full max-w-xl rounded-2xl border border-stone-700 bg-[#111315] animate-pulse" />
        <div className="h-6 w-24 mt-4 rounded bg-zinc-800/60 animate-pulse" />
      </div>
    );

  /* ==== FLAVORS ==== */
  const usesFlavors =
    product.hasFlavors ?? (product.flavors?.length ?? 0) > 0;

  const availableFlavors = usesFlavors
    ? Array.isArray(product.flavors) &&
      product.flavors.length > 0
      ? product.flavors
      : DEFAULT_FLAVORS
    : [];

  const showMainFlavors =
    usesFlavors && availableFlavors.length > 0;

  /* ==== IMAGEN ==== */
  const rawImg: string =
    product.imageUrl ||
    product.images?.[0] ||
    "https://picsum.photos/900";
  const img = optimizeImage(rawImg, 1000);
  const inStock: number = product.stock ?? 0;


  /* ==== PRECIOS ==== */
  const addOnTotal: number = extraVape.price ?? 0;
  const mainTotal: number = basePrice * qty;
  const grandTotal: number = mainTotal + addOnTotal;

  const canOpen3: boolean =
    open2 && !!extraVape.model;

  /* ==== Add to Cart ==== */
  const addToCart = (): void => {
    const item: CartItem = {
      id: product.id,
      name: product.name,
      price: basePrice, // precio con descuento ✔
      qty,
      flavor: showMainFlavors ? flavor : "",
      imageUrl: product.imageUrl || product.images?.[0],

      charger: null,

      extraVape: extraVape.model
        ? {
            model: extraVape.model,
            flavor: selectedModelHasFlavors
              ? extraVape.flavor
              : undefined,
            qty: extraVape.qty ?? 1,
            price: extraVape.price ?? 0,
          }
        : null,

      giftVape: giftVape.model
        ? {
            model: giftVape.model,
            flavor: showMainFlavors
              ? giftVape.flavor
              : undefined,
          }
        : null,
    };

    addItem(item);
    setOpen(true);
  };

  const hasPuffs: boolean =
    typeof product.puffs === "number" &&
    product.puffs > 0;

  const hasMl: boolean =
    typeof (product as Product & { ml?: number }).ml ===
      "number" &&
    (product as Product & { ml?: number }).ml! > 0;

  /* ==== UI ==== */
  return (
    <div className="p-6 text-zinc-100">
      <div className="mb-4">
        <Link
          to="/"
          className="text-sm text-amber-400 hover:underline"
        >
          ← Volver
        </Link>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* ==== Imagen del Producto ==== */}
        <div className="relative overflow-hidden rounded-2xl border border-stone-700 bg-[#111315]">
          <img
            src={img}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="eager"
          />
        </div>

        {/* ==== INFO DERECHA ==== */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-zinc-100">
              {product.name}
            </h1>

            {/* PRECIO CON DESCUENTO */}
            {discount > 0 ? (
              <>
                <div className="text-zinc-400 line-through">
                  {formatCOP(product.price)}
                </div>
                <div className="mt-1 text-2xl font-bold text-green-400">
                  {formatCOP(basePrice)}
                </div>
                <div className="text-xs text-green-400">
                  Descuento aplicado: {discount}%
                </div>
              </>
            ) : (
              <div className="mt-2 text-2xl font-bold text-amber-400">
                {formatCOP(product.price)}
              </div>
            )}

            {/* Info extra */}
            {hasPuffs ? (
              <div className="mt-1 text-sm text-zinc-400">
                {new Intl.NumberFormat("es-CO", {
                  maximumFractionDigits: 0,
                }).format(product.puffs!)}{" "}
                puffs
              </div>
            ) : hasMl ? (
              <div className="mt-1 text-sm text-zinc-400">
                {new Intl.NumberFormat("es-CO", {
                  maximumFractionDigits: 0,
                }).format(
                  (product as Product & { ml?: number }).ml!
                )}{" "}
                ml
              </div>
            ) : null}

            <p className="mt-2 text-zinc-300">
              {product.description ?? "—"}
            </p>

            <div className="mt-2 text-sm text-zinc-400">
              Stock disponible:{" "}
              <span className="font-semibold text-zinc-200">
                {inStock}
              </span>{" "}
              unidades
            </div>
          </div>

          {/* ==== Cantidad & sabor ==== */}
          <div className="rounded-2xl border border-stone-700 bg-[#111315] p-4 space-y-4">
            <div className="flex items-center gap-3">
              <label className="text-sm w-24 text-zinc-300">
                Cantidad
              </label>
              <input
                type="number"
                min={1}
                max={inStock || 99}
                value={qty}
                onChange={(e) =>
                  setQty(
                    Math.max(
                      1,
                      Math.min(
                        Number(e.target.value),
                        inStock || 99
                      )
                    )
                  )
                }
                className="w-24 rounded-xl bg-zinc-900 border border-stone-700 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            {/* Sabores */}
            {availableFlavors.length > 0 && (
              <div className="flex items-center gap-3">
                <label className="text-sm w-24 text-zinc-300">
                  Sabor
                </label>
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
            )}
          </div>

          {/* ==== Extra Vape ==== */}
          <div className="rounded-2xl border border-stone-700 overflow-hidden">
            <button
              type="button"
              onClick={() => setOpen2((v) => !v)}
              className="w-full text-left px-4 py-3 bg-[#1a1d1f] hover:bg-[#181b1d] flex items-center justify-between"
            >
              <span className="font-semibold text-zinc-100">
                ➕ Agregar otro vape
              </span>
              <span className="text-sm text-zinc-400">
                {open2 ? "Cerrar" : "Abrir"}
              </span>
            </button>

            {open2 && (
              <div className="bg-[#111315] p-4 space-y-4">
                {/* Categoría */}
                <div className="flex items-center gap-3">
                  <label className="text-sm w-24 text-zinc-300">
                    Categoría
                  </label>
                  <select
                    className="flex-1 rounded-xl bg-zinc-900 border border-stone-700 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    value={selectedCategoryId}
                    onChange={(e) =>
                      setSelectedCategoryId(e.target.value)
                    }
                  >
                    <option value="">Selecciona…</option>
                    {catLoading && (
                      <option disabled>Cargando categorías…</option>
                    )}
                    {catError && (
                      <option disabled>{catError}</option>
                    )}
                    {!catLoading &&
                      !catError &&
                      categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Modelo */}
                <div className="flex items-center gap-3">
                  <label className="text-sm w-24 text-zinc-300">
                    Modelo
                  </label>
                  <select
                    className="flex-1 rounded-xl bg-zinc-900 border border-stone-700 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    value={selectedModelId}
                    onChange={(e) =>
                      setSelectedModelId(e.target.value)
                    }
                    disabled={
                      !selectedCategoryId ||
                      modelsLoading ||
                      !!modelsError
                    }
                  >
                    {!selectedCategoryId && (
                      <option value="">
                        Selecciona categoría primero…
                      </option>
                    )}
                    {selectedCategoryId &&
                      modelsLoading && (
                        <option value="">Cargando…</option>
                      )}
                    {selectedCategoryId &&
                      modelsError && (
                        <option value="">
                          {modelsError}
                        </option>
                      )}

                    {selectedCategoryId &&
                      !modelsLoading &&
                      !modelsError && (
                        <>
                          <option value="">Selecciona…</option>
                          {modelsByCategory.map((p) => (
                            <option
                              key={getProductKey(p)}
                              value={getProductKey(p)}
                            >
                              {p.name} ({formatCOP(p.price)})
                            </option>
                          ))}
                        </>
                      )}
                  </select>
                </div>

                {/* Sabores extra */}
                {selectedModelHasFlavors && (
                  <div className="flex items-center gap-3">
                    <label className="text-sm w-24 text-zinc-300">
                      Sabor
                    </label>
                    <select
                      value={extraVape.flavor ?? ""}
                      onChange={(e) =>
                        setExtraVape((prev) => ({
                          ...prev,
                          flavor: e.target.value,
                        }))
                      }
                      className="flex-1 rounded-xl bg-zinc-900 border border-stone-700 px-3 py-2 text-sm text-zinc-100"
                    >
                      {selectedModelFlavors.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Cantidad extra */}
                <div className="flex items-center gap-3">
                  <label className="text-sm w-24 text-zinc-300">
                    Cantidad
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={extraVape.qty ?? 1}
                    onChange={(e) =>
                      setExtraVape((prev) => ({
                        ...prev,
                        qty: Math.max(1, Number(e.target.value)),
                      }))
                    }
                    className="w-24 rounded-xl bg-zinc-900 border border-stone-700 px-3 py-2 text-sm text-zinc-100"
                  />
                </div>
              </div>
            )}
          </div>

          {/* ==== Vape de Regalo ==== */}
          <div
            className={`rounded-2xl border overflow-hidden ${
              canOpen3
                ? "border-stone-700"
                : "border-stone-800 opacity-60 pointer-events-none"
            }`}
          >
            <button
              type="button"
              onClick={() => canOpen3 && setOpen3((v) => !v)}
              className="w-full text-left px-4 py-3 bg-[#1a1d1f] hover:bg-[#181b1d] flex items-center justify-between"
            >
              <span className="font-semibold text-zinc-100">
                🎁 Vape de regalo
              </span>
              <span className="text-sm text-zinc-400">
                {open3 ? "Cerrar" : "Abrir"}
              </span>
            </button>

            {!canOpen3 && (
              <StepNotice>
                Este paso se habilita al elegir un modelo en{" "}
                <b>"Agregar otro vape"</b>.
              </StepNotice>
            )}

            {open3 && canOpen3 && (
              <div className="bg-[#111315] p-4 space-y-4">
                {/* Modelo regalo */}
                <div className="flex items-center gap-3">
                  <label className="text-sm w-24 text-zinc-300">
                    Modelo
                  </label>
                  <select
                    value={giftVape.model ?? ""}
                    onChange={(e) =>
                      setGiftVape((prev) => ({
                        ...prev,
                        model: e.target.value,
                      }))
                    }
                    className="flex-1 rounded-xl bg-zinc-900 border border-stone-700 px-3 py-2 text-sm text-zinc-100"
                  >
                    <option value="" disabled>
                      Selecciona…
                    </option>

                    {giftVapeModels.map((m) => (
                      <option key={m.name} value={m.name}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sabor regalo */}
                {showMainFlavors && (
                  <div className="flex items-center gap-3">
                    <label className="text-sm w-24 text-zinc-300">
                      Sabor
                    </label>
                    <select
                      value={giftVape.flavor ?? ""}
                      onChange={(e) =>
                        setGiftVape((prev) => ({
                          ...prev,
                          flavor: e.target.value,
                        }))
                      }
                      className="flex-1 rounded-xl bg-zinc-900 border border-stone-700 px-3 py-2 text-sm text-zinc-100"
                    >
                      <option value="" disabled>
                        Selecciona…
                      </option>

                      {availableFlavors.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <p className="text-sm text-amber-400">
                  Este ítem es gratis como promoción.
                </p>
              </div>
            )}
          </div>

          {/* ==== TOTAL ==== */}
          <div className="flex items-center justify-between rounded-2xl border border-stone-700 bg-[#1a1d1f] px-4 py-3">
            <div className="text-sm text-zinc-300">
              <div>
                Total producto:{" "}
                <span className="font-semibold text-zinc-100">
                  {formatCOP(mainTotal)}
                </span>
              </div>
              <div>
                Extras:{" "}
                <span className="font-semibold text-zinc-100">
                  {formatCOP(addOnTotal)}
                </span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-lg font-bold text-amber-400">
                Total: {formatCOP(grandTotal)}
              </div>

              <button
                onClick={addToCart}
                className="mt-2 rounded-xl bg-amber-400 px-5 py-2 text-sm font-semibold text-black hover:bg-amber-300"
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
