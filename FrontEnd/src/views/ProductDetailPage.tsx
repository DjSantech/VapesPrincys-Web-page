// src/pages/ProductDetailPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams, Link } from "react-router-dom";
import axios, { AxiosError } from "axios";
import { getProductById } from "../services/products_service";
import type { Product } from "../types/Product";

type LocationState = { product?: Product };

const formatCOP = (cents: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 })
    .format(cents / 100);

// (opcional) type guard propio si quieres evitar depender de axios.isAxiosError
const isAxiosErr = (e: unknown): e is AxiosError =>
  !!e && typeof e === "object" && "isAxiosError" in e;

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const state = (location.state as LocationState) ?? {};

  const [product, setProduct] = useState<Product | undefined>(state.product);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(!state.product);

  const productId = useMemo(() => id ?? "", [id]);

  useEffect(() => {
    if (!productId || product) return;

    let active = true;
    (async () => {
      try {
        setLoading(true);
        const data = await getProductById(productId);
        if (active) setProduct(data);
      } catch (e: unknown) {
        // Usa el helper oficial...
        if (axios.isAxiosError(e)) {
          const status = e.response?.status;
          const msg = e.response?.data?.error ?? "Error al cargar";
          setError(status === 404 ? "Producto no encontrado" : msg);
        // ...o tu type guard propio:
        } else if (isAxiosErr(e)) {
          setError(e.message || "Error al cargar");
        } else if (e instanceof Error) {
          setError(e.message);
        } else {
          setError("Error desconocido");
        }
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => { active = false; };
  }, [productId, product]);

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

  const img = product.imageUrl || "https://picsum.photos/900";

  return (
    <div className="p-6 text-white">
      <div className="mb-4">
        <Link to="/" className="text-sm text-green-300 hover:underline">← Volver</Link>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="relative overflow-hidden rounded-2xl border border-green-700 bg-black/20">
          <img src={img} alt={product.name} className="w-full h-[28rem] object-cover" loading="lazy" />
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <div className="text-2xl font-bold text-green-400">{formatCOP(product.price)}</div>
          {product.description && <p className="text-white/80 leading-relaxed">{product.description}</p>}
          <button className="rounded-xl bg白/10 px-5 py-2 text-sm hover:bg-white/15" type="button">
            Agregar al carrito
          </button>
        </div>
      </div>
    </div>
  );
}
