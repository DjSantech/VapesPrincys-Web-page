import { useOutletContext } from "react-router-dom";

type Ctx = { product: { id: string; name: string; price: number; imageUrl?: string } | null };

const formatPrice = (cents: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 })
    .format(cents / 100);

export default function ProductDetailPage() {
  const { product } = useOutletContext<Ctx>();
  if (!product) return <p>No se encontró el producto.</p>;

  const img = product.imageUrl || "https://picsum.photos/seed/vape/900/900";

  return (
    <section className="grid gap-8 md:grid-cols-2">
      <div className="relative overflow-hidden rounded-2xl border border-green-700 bg-black/20">
        <img src={img} alt={product.name} className="w-full h-[28rem] object-cover" />
      </div>

      <div className="space-y-4">
        <h1 className="text-3xl font-bold">{product.name}</h1>
        <div className="text-2xl font-bold text-green-400">{formatPrice(product.price)}</div>
        <button className="rounded-xl bg-white/10 px-5 py-2 text-sm hover:bg-white/15">
          Agregar al carrito
        </button>
      </div>
    </section>
  );
}
