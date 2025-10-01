// src/layouts/ProductLayout.tsx
import { Outlet, useLocation, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import { getProductById } from "../services/products_service";

type ProductLite = { id: string; name: string; price: number; imageUrl?: string };

export default function ProductLayout() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation() as { state?: { product?: ProductLite } };
  const [product, setProduct] = useState<ProductLite | null>(location.state?.product || null);
  const [loading, setLoading] = useState(!location.state?.product);

  useEffect(() => {
    if (product || !id) return;
    (async () => {
      setLoading(true);
      try {
        const p = await getProductById(id); // ← tu service
        // adapta campos si tu API usa otras keys
        setProduct({ id: p.id, name: p.name, price: p.price, imageUrl: p.images?.[0] });
      } finally { setLoading(false); }
    })();
  }, [id, product]);

  return (
    <div className="min-h-screen bg-[#182c25] text-white">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-6">
        {loading ? <p>Cargando producto…</p> : <Outlet context={{ product }} />}
      </main>
    </div>
  );
}
