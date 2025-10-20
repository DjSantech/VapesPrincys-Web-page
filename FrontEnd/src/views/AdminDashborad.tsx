// src/views/AdminDashboard.tsx
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  getProducts,
  patchProduct,
  createProduct,
  patchProductImage,
  deleteProduct,
  type AdminProduct,
  // --- categorías:
  getCategories,
  createCategory,
  deleteCategoryById,
  type AdminCategory,
} from "../services/admin";

// helpers CSV
const toArray = (v: string): string[] => v.split(",").map(s => s.trim()).filter(Boolean);
const fromArray = (arr?: string[]): string => (arr ?? []).join(", ");

const fmt = (cents: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 })
    .format((cents || 0) / 100);

type Drafts = Record<string, Partial<AdminProduct> & { flavorsCSV?: string }>;

export default function AdminDashboard() {
  const [items, setItems] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // ---- categorías ----
  const [cats, setCats] = useState<AdminCategory[]>([]);
  const [catsLoading, setCatsLoading] = useState<boolean>(false);
  const [showCats, setShowCats] = useState<boolean>(false);
  const [newCat, setNewCat] = useState<string>("");

  // ---- crear producto ----
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<{
    sku: string;
    name: string;
    price: number;          // centavos
    stock: number;
    visible: boolean;
    category: string;       // guardaremos el NOMBRE de la categoría elegida
    flavorsCSV: string;     // texto crudo -> se parsea al enviar
    image: File | null;
  }>({
    sku: "",
    name: "",
    price: 0,
    stock: 0,
    visible: true,
    category: "",
    flavorsCSV: "",
    image: null,
  });

  // ---- borradores por fila ----
  const [drafts, setDrafts] = useState<Drafts>({});
  const setDraft = (id: string, patch: Partial<AdminProduct> & { flavorsCSV?: string }) =>
    setDrafts(prev => ({ ...prev, [id]: { ...(prev[id] ?? {}), ...patch } }));

  const imagePreview = useMemo(
    () => (form.image ? URL.createObjectURL(form.image) : ""),
    [form.image]
  );

  const resetForm = () => {
    setForm({
      sku: "",
      name: "",
      price: 0,
      stock: 0,
      visible: true,
      category: "",
      flavorsCSV: "",
      image: null,
    });
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setItems(data);
      setDrafts({});
    } catch {
      toast.error("No se pudieron cargar los productos");
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      setCatsLoading(true);
      const data = await getCategories();
      setCats(data);
    } catch {
      toast.error("No se pudieron cargar las categorías");
    } finally {
      setCatsLoading(false);
    }
  };

  useEffect(() => { void loadProducts(); }, []);
  useEffect(() => { void loadCategories(); }, []);

  // ---- update solo imagen (multipart) ----
  const updateImage = async (id: string, file: File) => {
    try {
      const tempUrl = URL.createObjectURL(file);
      setItems(prev => prev.map(p => (p.id === id ? { ...p, imageUrl: tempUrl } : p)));

      const updated = await patchProductImage(id, file);
      setItems(prev => prev.map(p => (p.id === id ? updated : p)));
      toast.success("Imagen actualizada");
    } catch {
      toast.error("No se pudo actualizar la imagen");
      void loadProducts();
    }
  };

  // ---- guardar cambios de una fila ----
  const onSaveRow = async (id: string) => {
    const current = items.find(p => p.id === id);
    if (!current) return;

    const draft = drafts[id] ?? {};
    const merged: AdminProduct = { ...current, ...draft };

    // si el usuario quiso vaciar categoría, no mandes category: ""
    const categoryTrim = (merged.category ?? "").trim();

    const patch: Partial<AdminProduct> = {
      sku: merged.sku,
      name: merged.name,
      price: Math.max(0, Math.round(merged.price ?? 0)),
      stock: Math.max(0, Math.round(merged.stock ?? 0)),
      visible: merged.visible,
      ...(categoryTrim !== "" ? { category: categoryTrim } : {}),
      flavors: draft.flavorsCSV !== undefined
        ? toArray(draft.flavorsCSV)
        : (merged.flavors ?? []),
      imageUrl: undefined,
      id: undefined as unknown as never,
    };

    try {
      await patchProduct(id, patch);
      toast.success("Producto actualizado");
      await loadProducts();
    } catch {
      toast.error("Error actualizando producto");
    }
  };

  // ---- eliminar producto ----
  const onDeleteRow = async (id: string) => {
    const p = items.find(x => x.id === id);
    if (!p) return;
    const ok = window.confirm(`¿Eliminar el producto "${p.name}"? Esta acción no se puede deshacer.`);
    if (!ok) return;
    try {
      await deleteProduct(id);
      setItems(prev => prev.filter(x => x.id !== id));
      setDrafts(prev => {
        const rest = { ...prev };
        delete rest[id];
        return rest;
      });
      toast.success("Producto eliminado");
    } catch {
      toast.error("No se pudo eliminar el producto");
    }
  };

  // ---- crear producto ----
  const onCreate = async () => {
    if (!form.sku.trim())  { toast.error("El SKU es obligatorio"); return; }
    if (!form.name.trim()) { toast.error("El nombre es obligatorio"); return; }
    if (form.price < 0)    { toast.error("El precio no puede ser negativo"); return; }
    if (form.stock < 0)    { toast.error("El stock no puede ser negativo"); return; }

    try {
      const created = await createProduct({
        sku: form.sku.trim().toUpperCase(),
        name: form.name.trim(),
        price: Math.round(form.price),
        stock: Math.max(0, Math.round(form.stock)),
        visible: form.visible,
        // guardamos el NOMBRE de la categoría seleccionada (backend Opción A = texto)
        category: form.category.trim(),
        image: form.image,
        flavors: toArray(form.flavorsCSV),
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

  // ---- categorías: crear y eliminar ----
  const onCreateCategory = async () => {
    const name = newCat.trim();
    if (!name) return;
    try {
      const created = await createCategory(name);
      setCats(prev => [created, ...prev]);
      setNewCat("");
      toast.success("Categoría creada");
    } catch (e) {
      console.error(e);
      toast.error("No se pudo crear la categoría");
    }
  };

  const onDeleteCategory = async (id: string) => {
    const cat = cats.find(c => c.id === id);
    if (!cat) return;
    const ok = window.confirm(`¿Eliminar la categoría "${cat.name}"?`);
    if (!ok) return;
    try {
      await deleteCategoryById(id);
      setCats(prev => prev.filter(c => c.id !== id));
      // si la categoría eliminada estaba seleccionada en el formulario, límpiala
      setForm(f => (f.category === cat.name ? { ...f, category: "" } : f));
      toast.success("Categoría eliminada");
    } catch (e) {
      console.error(e);
      toast.error("No se pudo eliminar la categoría");
    }
  };

  return (
    <div className="px-3 sm:px-4 md:px-6 py-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl sm:text-2xl font-bold text-zinc-100">Panel de administración</h1>
        <div className="flex flex-wrap items-center gap-2">
          <button
            className="rounded-lg bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 text-sm text-white"
            onClick={() => setShowCats(true)}
          >
            Categorías
          </button>
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

      {/* Lista de productos (cards) */}
      <div className="space-y-3">
        {loading ? (
          <div className="rounded-2xl border border-stone-800 bg-[#1a1d1f] p-6 text-zinc-400">Cargando…</div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-stone-800 bg-[#1a1d1f] p-6 text-zinc-400">Sin productos</div>
        ) : (
          items.map(p => {
            const d = drafts[p.id] ?? {};
            const name = d.name ?? p.name;
            const sku = (d.sku ?? p.sku) ?? "";
            const price = Math.round(d.price ?? p.price ?? 0);
            const stock = Math.round(d.stock ?? p.stock ?? 0);
            const category = (d.category ?? p.category) ?? "";
            const flavorsCSV = d.flavorsCSV ?? fromArray(d.flavors ?? p.flavors);
            const visible = (d.visible ?? p.visible) ?? true;

            return (
              <div key={p.id} className="rounded-2xl border border-stone-800 bg-[#1a1d1f] p-4">
                {/* Encabezado + imagen */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex items-center gap-3">
                    <label className="relative">
                      <img
                        src={p.imageUrl || "https://picsum.photos/seed/vape/96"}
                        className="h-14 w-14 object-cover rounded-lg ring-1 ring-stone-800"
                        alt={p.name}
                      />
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        title="Cambiar imagen"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) { void updateImage(p.id, file); }
                        }}
                      />
                    </label>
                    <div className="flex-1 min-w-0">
                      <input
                        className="w-full rounded-lg bg-[#0f1113] ring-1 ring-stone-800 px-2 py-1 text-sm text-zinc-100"
                        value={name}
                        onChange={e => setDraft(p.id, { name: e.target.value })}
                        placeholder="Nombre del producto"
                      />
                      <div className="text-[11px] text-zinc-500 mt-0.5 truncate">
                        ID: {p.id}
                      </div>
                    </div>
                  </div>

                  {/* Acciones (sm+) */}
                  <div className="hidden sm:flex gap-2 sm:ml-auto">
                    <button
                      className="rounded-lg bg-amber-600 hover:bg-amber-700 px-3 py-1.5 text-sm text-white"
                      onClick={() => void onSaveRow(p.id)}
                    >
                      Actualizar producto
                    </button>
                    <button
                      className="rounded-lg bg-red-600 hover:bg-red-700 px-3 py-1.5 text-sm text-white"
                      onClick={() => void onDeleteRow(p.id)}
                    >
                      Eliminar producto
                    </button>
                  </div>
                </div>

                {/* Campos editables */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs text-zinc-400">SKU</label>
                    <input
                      className="w-full rounded-lg bg-[#0f1113] ring-1 ring-stone-800 px-2 py-1 text-sm text-zinc-100 uppercase"
                      value={sku}
                      onChange={e => setDraft(p.id, { sku: e.target.value.toUpperCase() })}
                      placeholder="VAPE-UV-5000"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-zinc-400">Precio (centavos)</label>
                    <input
                      type="number"
                      className="w-full rounded-lg bg-[#0f1113] ring-1 ring-stone-800 px-2 py-1 text-sm text-zinc-100"
                      value={price}
                      onChange={e => setDraft(p.id, { price: Math.max(0, Number(e.target.value)) })}
                    />
                    <div className="text-[11px] text-zinc-500 mt-0.5">{fmt(price)}</div>
                  </div>

                  <div>
                    <label className="text-xs text-zinc-400">Stock</label>
                    <input
                      type="number"
                      className="w-full rounded-lg bg-[#0f1113] ring-1 ring-stone-800 px-2 py-1 text-sm text-zinc-100"
                      value={stock}
                      onChange={e => setDraft(p.id, { stock: Math.max(0, Number(e.target.value)) })}
                    />
                  </div>

                  {/* Categoría (select) */}
                  <div>
                    <label className="text-xs text-zinc-400">Categoría</label>
                    <select
                      className="w-full rounded-lg bg-[#0f1113] ring-1 ring-stone-800 px-2 py-1 text-sm text-zinc-100"
                      value={category}
                      onChange={e => setDraft(p.id, { category: e.target.value })}
                    >
                      <option value="">— Selecciona —</option>
                      {cats.map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                    <div className="text-[11px] text-zinc-500 mt-0.5">
                      Administra categorías en el botón “Categorías”.
                    </div>
                  </div>


                  <div className="lg:col-span-2">
                    <label className="text-xs text-zinc-400">Sabores (separados por coma)</label>
                    <input
                      className="w-full rounded-lg bg-[#0f1113] ring-1 ring-stone-800 px-2 py-1 text-sm text-zinc-100"
                      value={flavorsCSV}
                      onChange={e => setDraft(p.id, { flavorsCSV: e.target.value })}
                      placeholder="Uva, Menta, Sandía"
                    />
                    <div className="text-[11px] text-zinc-500 mt-0.5">
                      Se guardan al presionar “Actualizar producto”
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      id={`visible-${p.id}`}
                      type="checkbox"
                      className="accent-emerald-400"
                      checked={visible}
                      onChange={e => setDraft(p.id, { visible: e.target.checked })}
                    />
                    <label htmlFor={`visible-${p.id}`} className="text-xs text-zinc-400">Visible</label>
                  </div>
                </div>

                {/* Acciones (móvil) */}
                <div className="mt-4 flex flex-col sm:hidden gap-2">
                  <button
                    className="rounded-lg bg-amber-600 hover:bg-amber-700 px-3 py-2 text-sm text-white"
                    onClick={() => void onSaveRow(p.id)}
                  >
                    Actualizar producto
                  </button>
                  <button
                    className="rounded-lg bg-red-600 hover:bg-red-700 px-3 py-2 text-sm text-white"
                    onClick={() => void onDeleteRow(p.id)}
                  >
                    Eliminar producto
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <p className="mt-4 text-xs text-zinc-500">
        Edita los campos y presiona <span className="text-amber-400 font-medium">“Actualizar producto”</span> en cada tarjeta para guardar los cambios. La imagen se guarda al seleccionarla.
      </p>

      {/* Modal crear producto */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-3">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
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
                <label className="text-xs text-zinc-400">SKU</label>
                <input
                  className="w-full rounded-lg bg-[#0f1113] ring-1 ring-stone-800 px-2 py-1 text-sm text-zinc-100 uppercase"
                  value={form.sku}
                  onChange={e => setForm(f => ({ ...f, sku: e.target.value.toUpperCase() }))}
                  placeholder="VAPE-UV-5000"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400">Categoría</label>
                <select
                  className="w-full rounded-lg bg-[#0f1113] ring-1 ring-stone-800 px-2 py-1 text-sm text-zinc-100"
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                >
                  <option value="">— Selecciona —</option>
                  {cats.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
                <div className="text-[11px] text-zinc-500 mt-0.5">
                  Administra categorías en el botón “Categorías”.
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs text-zinc-400">Sabores (separados por coma)</label>
                <input
                  className="w-full rounded-lg bg-[#0f1113] ring-1 ring-stone-800 px-2 py-1 text-sm text-zinc-100"
                  value={form.flavorsCSV}
                  onChange={e => setForm(f => ({ ...f, flavorsCSV: e.target.value }))}
                  placeholder="Uva, Menta, Sandía"
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

              <div className="sm:col-span-2">
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

      {/* Modal categorías */}
      {showCats && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-3">
          <div className="w-full max-w-lg rounded-2xl border border-stone-800 bg-[#1a1d1f] p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-zinc-100">Categorías</h2>
              <button
                className="text-sm rounded-lg bg-[#2a2a28] border border-stone-700 px-2 py-1 text-zinc-200 hover:bg-[#323230]"
                onClick={() => setShowCats(false)}
              >
                ✕
              </button>
            </div>

            <div className="mb-3">
              <label className="text-xs text-zinc-400">Nueva categoría</label>
              <div className="flex gap-2">
                <input
                  className="flex-1 rounded-lg bg-[#0f1113] ring-1 ring-stone-800 px-2 py-1 text-sm text-zinc-100"
                  value={newCat}
                  onChange={e => setNewCat(e.target.value)}
                  placeholder="desechables"
                />
                <button
                  className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-sm text-white"
                  onClick={() => void onCreateCategory()}
                  disabled={catsLoading}
                >
                  Crear
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-stone-800 overflow-hidden">
              <div className="bg-[#0f1113] px-3 py-2 text-xs text-zinc-400">
                {catsLoading ? "Cargando categorías…" : `Total: ${cats.length}`}
              </div>
              <ul className="max-h-72 overflow-auto divide-y divide-stone-800">
                {cats.map(c => (
                  <li key={c.id} className="flex items-center justify-between px-3 py-2">
                    <span className="text-sm text-zinc-100">{c.name}</span>
                    <button
                      className="rounded-md bg-red-600 hover:bg-red-700 px-2 py-1 text-xs text-white"
                      onClick={() => void onDeleteCategory(c.id)}
                    >
                      Eliminar
                    </button>
                  </li>
                ))}
                {cats.length === 0 && !catsLoading && (
                  <li className="px-3 py-3 text-sm text-zinc-400">No hay categorías</li>
                )}
              </ul>
            </div>

            <div className="mt-3 text-right">
              <button
                className="rounded-lg bg-[#2a2a28] border border-stone-700 px-3 py-1.5 text-sm text-zinc-200 hover:bg-[#323230]"
                onClick={() => setShowCats(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
