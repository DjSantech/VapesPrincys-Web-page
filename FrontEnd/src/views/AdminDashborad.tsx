// src/views/AdminDashboard.tsx
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { getProducts, patchProduct, createProduct } from "../services/admin";

type AdminProduct = {
  id: string;
  name: string;
  price: number;   // centavos
  stock?: number;
  visible?: boolean;
  imageUrl?: string;
  category?: string;
};

const fmt = (cents: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format((cents || 0) / 100);

export default function AdminDashboard() {
  const [items, setItems] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // ---- estado para crear producto ----
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<{
    name: string;
    price: number;          // centavos
    stock: number;
    visible: boolean;
    category: string;
    image: File | null;
  }>({
    name: "",
    price: 0,
    stock: 0,
    visible: true,
    category: "",
    image: null,
  });

  const imagePreview = useMemo(() => form.image ? URL.createObjectURL(form.image) : "", [form.image]);

  const resetForm = () => {
    setForm({ name: "", price: 0, stock: 0, visible: true, category: "", image: null });
  };

  const load = async () => {
    try {
      setLoading(true);
      const data = await getProducts(); // GET
      setItems(data);
    } catch {
      toast.error("No se pudieron cargar los productos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const update = async (id: string, patch: Partial<AdminProduct>) => {
    try {
      // optimista
      setItems(prev => prev.map(p => p.id === id ? { ...p, ...patch } : p));
      await patchProduct(id, patch); // PATCH
      toast.success("Cambios guardados");
    } catch {
      toast.error("Error guardando cambios");
      load(); // revertir recargando
    }
  };

  const onCreate = async () => {
    // validaciones muy básicas
    if (!form.name.trim()) return toast.error("El nombre es obligatorio");
    if (form.price < 0)    return toast.error("El precio no puede ser negativo");
    if (form.stock < 0)    return toast.error("El stock no puede ser negativo");

    try {
      const created = await createProduct({
        name: form.name.trim(),
        price: Math.round(form.price),         // ya en centavos
        stock: Math.max(0, Math.round(form.stock)),
        visible: form.visible,
        category: form.category.trim(),
        image: form.image,
      });
      setItems(prev => [created, ...prev]);
      toast.success("Producto creado");
      setShowCreate(false);
      resetForm();
    } catch (e) {
      console.error(e);
      toast.error("No se pudo crear el producto");
    }
  };

  return (
    <div className="px-4 sm:px-6 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-100">Panel de administración</h1>
        <div className="flex items-center gap-2">
          <button
            className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-sm text-white"
            onClick={() => setShowCreate(true)}
          >
            + Agregar producto
          </button>
          <button
            className="text-sm rounded-lg bg-[#2a2a28] border border-stone-700 px-3 py-1.5 text-zinc-200 hover:bg-[#323230]"
            onClick={() => { localStorage.removeItem("admin_token"); location.href = "/"; }}
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-stone-800 bg-[#1a1d1f] overflow-hidden">
        <div className="grid grid-cols-12 gap-3 px-4 py-3 text-xs sm:text-sm text-zinc-400 border-b border-stone-800">
          <div className="col-span-5 sm:col-span-4">Producto</div>
          <div className="col-span-3 sm:col-span-2">Precio</div>
          <div className="col-span-2 sm:col-span-2">Stock</div>
          <div className="col-span-2 sm:col-span-2">Visible</div>
          <div className="hidden sm:block col-span-2">Acciones</div>
        </div>

        {loading ? (
          <div className="p-6 text-zinc-400">Cargando…</div>
        ) : items.length === 0 ? (
          <div className="p-6 text-zinc-400">Sin productos</div>
        ) : (
          items.map(p => (
            <div key={p.id} className="grid grid-cols-12 gap-3 px-4 py-3 border-b border-stone-900 items-center">
              <div className="col-span-5 sm:col-span-4 flex items-center gap-3 min-w-0">
                <img
                  src={p.imageUrl || "https://picsum.photos/seed/vape/80"}
                  className="h-12 w-12 object-cover rounded-lg"
                  alt={p.name}
                />
                <div className="min-w-0">
                  <div className="text-zinc-100 font-medium line-clamp-1">{p.name}</div>
                  <div className="text-xs text-zinc-400">{p.category || "Sin categoría"}</div>
                </div>
              </div>

              <div className="col-span-3 sm:col-span-2">
                <input
                  type="number"
                  className="w-full rounded-lg bg-[#0f1113] ring-1 ring-stone-800 px-2 py-1 text-sm text-zinc-100"
                  value={Math.round(p.price ?? 0)}
                  onChange={e => update(p.id, { price: Number(e.target.value) })}
                />
                <div className="text-[11px] text-zinc-500">{fmt(p.price)}</div>
              </div>

              <div className="col-span-2 sm:col-span-2">
                <input
                  type="number"
                  className="w-full rounded-lg bg-[#0f1113] ring-1 ring-stone-800 px-2 py-1 text-sm text-zinc-100"
                  value={p.stock ?? 0}
                  onChange={e => update(p.id, { stock: Math.max(0, Number(e.target.value)) })}
                />
              </div>

              <div className="col-span-2 sm:col-span-2">
                <label className="inline-flex items-center gap-2 text-sm text-zinc-200">
                  <input
                    type="checkbox"
                    className="accent-emerald-400"
                    checked={p.visible ?? true}
                    onChange={e => update(p.id, { visible: e.target.checked })}
                  />
                  <span className="text-xs text-zinc-400">{(p.visible ?? true) ? "Sí" : "No"}</span>
                </label>
              </div>

              <div className="hidden sm:flex col-span-2 justify-end">
                <button
                  className="rounded-lg bg-[#2a2a28] border border-stone-700 px-3 py-1.5 text-sm text-zinc-200 hover:bg-[#323230]"
                  onClick={() => toast("Guardado automáticamente al cambiar campos")}
                >
                  Info
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <p className="mt-3 text-xs text-zinc-500">
        Los cambios se guardan automáticamente al editar los campos.
      </p>

      {/* Modal crear producto */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="w-full max-w-lg rounded-2xl border border-stone-800 bg-[#1a1d1f] p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-zinc-100">Nuevo producto</h2>
              <button
                className="text-sm rounded-lg bg-[#2a2a28] border border-stone-700 px-2 py-1 text-zinc-200 hover:bg-[#323230]"
                onClick={() => { setShowCreate(false); resetForm(); }}
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs text-zinc-400">Nombre</label>
                <input
                  className="w-full rounded-lg bg-[#0f1113] ring-1 ring-stone-800 px-2 py-1 text-sm text-zinc-100"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Vape Desechable XYZ"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400">Precio (centavos)</label>
                <input
                  type="number"
                  className="w-full rounded-lg bg-[#0f1113] ring-1 ring-stone-800 px-2 py-1 text-sm text-zinc-100"
                  value={form.price}
                  onChange={e => setForm(f => ({ ...f, price: Math.max(0, Number(e.target.value)) }))}
                />
                <div className="text-[11px] text-zinc-500 mt-0.5">{fmt(form.price)}</div>
              </div>

              <div>
                <label className="text-xs text-zinc-400">Stock</label>
                <input
                  type="number"
                  className="w-full rounded-lg bg-[#0f1113] ring-1 ring-stone-800 px-2 py-1 text-sm text-zinc-100"
                  value={form.stock}
                  onChange={e => setForm(f => ({ ...f, stock: Math.max(0, Number(e.target.value)) }))}
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400">Categoría</label>
                <input
                  className="w-full rounded-lg bg-[#0f1113] ring-1 ring-stone-800 px-2 py-1 text-sm text-zinc-100"
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  placeholder="desechables"
                />
              </div>

              <div className="flex items-center gap-2 mt-1">
                <input
                  id="visible"
                  type="checkbox"
                  className="accent-emerald-400"
                  checked={form.visible}
                  onChange={e => setForm(f => ({ ...f, visible: e.target.checked }))}
                />
                <label htmlFor="visible" className="text-xs text-zinc-400">Visible</label>
              </div>

              <div className="col-span-2">
                <label className="text-xs text-zinc-400">Imagen</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setForm(f => ({ ...f, image: e.target.files?.[0] || null }))}
                  className="w-full text-xs text-zinc-300"
                />
                {imagePreview && (
                  <img src={imagePreview} alt="preview" className="mt-2 h-24 w-24 object-cover rounded-lg ring-1 ring-stone-800" />
                )}
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                className="rounded-lg bg-[#2a2a28] border border-stone-700 px-3 py-1.5 text-sm text-zinc-200 hover:bg-[#323230]"
                onClick={() => { setShowCreate(false); resetForm(); }}
              >
                Cancelar
              </button>
              <button
                className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-sm text-white"
                onClick={onCreate}
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
