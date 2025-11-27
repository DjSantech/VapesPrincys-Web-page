// src/views/AdminDashboard.tsx
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  getBanner,
  getProducts,
  patchProduct,
  createProduct,
  patchProductImage,
  deleteProduct,
  type AdminProduct,
  // categorías:
  getCategories,
  createCategory,
  deleteCategoryById,
  patchCategory,
  patchCategoryImage, // <--- CAMBIO 1: Importar la nueva función de servicio
  type AdminCategory, // ⚠️ Asumimos que AdminCategory ahora tiene 'imageUrl?: string'
  // ===== PLUS =====
  getPluses,
  createPlus,
  deletePlusById,
  type AdminPlus,
} from "../services/admin";

// helpers CSV
const toArray = (v: string): string[] => v.split(",").map(s => s.trim()).filter(Boolean);
const fromArray = (arr?: string[]): string => (arr ?? []).join(", ");

const fmt = (cents: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 })
    .format((cents || 0));

type Drafts = Record<
  string,
  Partial<AdminProduct> & {
    flavorsCSV?: string;
    pluses?: string[];
    hasFlavors?: boolean;
  }
>;

function toggleString(arr: readonly string[], value: string): string[] {
  return arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];
}

export default function AdminDashboard() {
  const [items, setItems] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // ---- categorías ----
  const [cats, setCats] = useState<AdminCategory[]>([]);
  const [catsLoading, setCatsLoading] = useState<boolean>(false);
  const [showCats, setShowCats] = useState<boolean>(false);
  const [newCat, setNewCat] = useState<string>("");

  // CAMBIO 2: Estado para borradores de imagen de categoría
  type CategoryDrafts = Record<string, { imageFile?: File | null }>;
  const [catDrafts, setCatDrafts] = useState<CategoryDrafts>({});
  const setCatDraft = (id: string, patch: CategoryDrafts[string]) =>
      setCatDrafts(prev => ({ ...prev, [id]: { ...(prev[id] ?? {}), ...patch } }));


  // ordenadas por homeOrder (menor primero), luego nombre
  const catsOrdered = useMemo(
    () => [...cats].sort(
      (a, b) => (a.homeOrder ?? 1000) - (b.homeOrder ?? 1000) || a.name.localeCompare(b.name, "es")
    ),
    [cats]
  );

  // ---- pluses ----
  const [pluses, setPluses] = useState<AdminPlus[]>([]);
  const [plusesLoading, setPlusesLoading] = useState<boolean>(false);
  const [showPluses, setShowPluses] = useState<boolean>(false);
  const [newPlus, setNewPlus] = useState<string>("");

  // ---- crear producto ----
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<{
    sku: string;
    name: string;
    description: string;
    price: number;          // centavos
    stock: number;
    puffs: number;
    ml: number;
    visible: boolean;
    category: string;       // nombre de categoría
    hasFlavors: boolean;    // NUEVO
    flavorsCSV: string;     // texto → se parsea al enviar
    pluses: string[];       // nombres de plus seleccionados
    image: File | null;
  }>({
    sku: "",
    name: "",
    description: "",
    price: 0,
    stock: 0,
    puffs: 0,
    ml: 0,
    visible: true,
    category: "",
    hasFlavors: true,
    flavorsCSV: "",
    pluses: [],
    image: null,
  });

  // ---- borradores por fila ----
  const [drafts, setDrafts] = useState<Drafts>({});
  const setDraft = (id: string, patch: Drafts[string]) =>
    setDrafts(prev => ({ ...prev, [id]: { ...(prev[id] ?? {}), ...patch } }));

  const imagePreview = useMemo(
    () => (form.image ? URL.createObjectURL(form.image) : ""),
    [form.image]
  );

  const resetForm = () => {
    setForm({
      sku: "",
      name: "",
      description: "",
      price: 0,
      stock: 0,
      puffs: 0,
      ml: 0,
      visible: true,
      category: "",
      hasFlavors: true,
      flavorsCSV: "",
      pluses: [],
      image: null,
    });
  };


  const loadBanner = async () => {
  try {
    const data = await getBanner();

    if (data) {
      const catsObj: Record<string, string> = {};
      const vapeObj: Record<string, string> = {};

      Object.keys(data).forEach(day => {
        if (data[day]) {
          catsObj[day] = data[day].category ?? "";
          vapeObj[day] = data[day].vapeId ?? "";
        }
      });

      setBannerCategory(catsObj);
      setBannerVape(vapeObj);
    }
  } catch (err) {
    console.error("Error cargando banner:", err);
  }
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
      // ⚠️ getCategories debe devolver objetos AdminCategory con la propiedad imageUrl
      const data = await getCategories(); 
      setCats(data);
      setCatDrafts({}); // Limpiar borradores al recargar
    } catch {
      toast.error("No se pudieron cargar las categorías");
    } finally {
      setCatsLoading(false);
    }
  };

  const loadPluses = async () => {
    try {
      setPlusesLoading(true);
      const data = await getPluses();
      setPluses(data);
    } catch {
      toast.error("No se pudieron cargar los pluses");
    } finally {
      setPlusesLoading(false);
    }
  };

  useEffect(() => { void loadProducts(); }, []);
  useEffect(() => { void loadCategories(); }, []);
  useEffect(() => { void loadPluses(); }, []);
  useEffect(() => {void loadBanner();}, []);

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
    const merged: AdminProduct & { hasFlavors?: boolean; flavors?: string[] } = { ...current, ...draft };

    const categoryTrim = (merged.category ?? "").trim();
    const nextPluses = draft.pluses ?? merged.pluses ?? [];
    const hasFlavors: boolean =
      draft.hasFlavors ??
      (typeof merged.hasFlavors === "boolean" ? merged.hasFlavors : (merged.flavors?.length ?? 0) > 0);

    const nextFlavors = hasFlavors
      ? (draft.flavorsCSV !== undefined ? toArray(draft.flavorsCSV) : (merged.flavors ?? []))
      : [];

    const patch: Partial<AdminProduct> & {
      imageUrl?: undefined;
      hasFlavors?: boolean;
      flavors?: string[];
    } = {
      sku: merged.sku,
      name: merged.name,
      description: merged.description ?? "",
      price: Math.max(0, Math.round(merged.price ?? 0)),
      stock: Math.max(0, Math.round(merged.stock ?? 0)),
      puffs: Math.max(0, Math.round(merged.puffs ?? 0)),
      ml: Math.max(0, Math.round(merged.ml ?? 0)),
      visible: merged.visible,
      hasFlavors,
      ...(categoryTrim !== "" ? { category: categoryTrim } : {}),
      flavors: nextFlavors,
      pluses: nextPluses,
      imageUrl: undefined,
    };

    try {
      await patchProduct(id, patch);
      toast.success("Producto actualizado");
      await loadProducts();
    } catch (e) {
      console.error(e);
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
    if (form.puffs < 0)    { toast.error("Los puffs no pueden ser negativos"); return; }
    if (form.ml < 0)       { toast.error("Los ml no pueden ser negativos"); return; }

    try {
      const created = await createProduct({
        sku: form.sku.trim().toUpperCase(),
        name: form.name.trim(),
        description: form.description.trim(),
        price: Math.round(form.price),
        stock: Math.max(0, Math.round(form.stock)),
        puffs: Math.max(0, Math.round(form.puffs)),
        ml: Math.max(0, Math.round(form.ml)),
        visible: form.visible,
        category: form.category.trim(),
        image: form.image,
        hasFlavors: form.hasFlavors,
        flavors: form.hasFlavors ? toArray(form.flavorsCSV) : [],
        pluses: form.pluses,
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
      setForm(f => (f.category === cat.name ? { ...f, category: "" } : f));
      toast.success("Categoría eliminada");
    } catch (e) {
      console.error(e);
      toast.error("No se pudo eliminar la categoría");
    }
  };

  // ---- pluses: crear y eliminar ----
  const onCreatePlus = async () => {
    const name = newPlus.trim();
    if (!name) return;
    try {
      const created = await createPlus(name);
      setPluses(prev => [created, ...prev]);
      setNewPlus("");
      toast.success("Plus creado");
    } catch (e) {
      console.error(e);
      toast.error("No se pudo crear el plus");
    }
  };

  const onDeletePlus = async (id: string) => {
    const pl = pluses.find(p => p.id === id);
    if (!pl) return;
    const ok = window.confirm(`¿Eliminar el plus "${pl.name}"?`);
    if (!ok) return;
    try {
      await deletePlusById(id);
      setPluses(prev => prev.filter(p => p.id !== id));
      // quitarlo del form si estaba seleccionado
      setForm(f => ({ ...f, pluses: f.pluses.filter(n => n !== pl.name) }));
      // quitarlo de borradores
      setDrafts(prev => {
        const next: Drafts = {};
        for (const [pid, d] of Object.entries(prev)) {
          next[pid] = { ...d, pluses: (d.pluses ?? []).filter(n => n !== pl.name) };
        }
        return next;
      });
      toast.success("Plus eliminado");
    } catch (e) {
      console.error(e);
      toast.error("No se pudo eliminar el plus");
    }
  };

  // ---- Banner ----
  const [showBanner, setShowBanner] = useState(false);

  const weekDays = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
  ];

  // Estado: para cada día, la categoría seleccionada
  const [bannerCategory, setBannerCategory] = useState<Record<string, string>>({});

  // Estado: para cada día, el vape seleccionado
  const [bannerVape, setBannerVape] = useState<Record<string, string>>({});


  return (
    <div className="px-3 sm:px-4 md:px-6 py-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl sm:text-2xl font-bold text-zinc-100">Panel de administración</h1>
        <div className="flex flex-wrap items-center gap-2">
          <button
            className="rounded-lg bg-purple-600 hover:bg-purple-700 px-3 py-1.5 text-sm text-white"
            onClick={() => setShowBanner(true)}
          >
            Banner
          </button>

          <button
            className="rounded-lg bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 text-sm text-white"
            onClick={() => setShowCats(true)}
          >
            Categorías
          </button>
          <button
            className="rounded-lg bg-sky-600 hover:bg-sky-700 px-3 py-1.5 text-sm text-white"
            onClick={() => setShowPluses(true)}
          >
            Pluses
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
            const puffs = Math.round(d.puffs ?? p.puffs ?? 0);
            const ml = Math.round(d.ml ?? p.ml ?? 0);
            const category = (d.category ?? p.category) ?? "";
            const description = d.description ?? p.description ?? "";

            // sabores
            const inferredHasFlavors = p.hasFlavors as boolean | undefined;
            const hasFlavors = d.hasFlavors ?? (typeof inferredHasFlavors === "boolean"
              ? inferredHasFlavors
              : ((p.flavors?.length ?? 0) > 0));
            const flavorsCSV = d.flavorsCSV ?? fromArray(d.flavors ?? p.flavors);

            // pluses por nombre
            const assignedPluses: string[] = d.pluses ?? p.pluses ?? [];

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

                {/* Descripción (edición) */}
                <div className="mt-3">
                  <label className="text-xs text-zinc-400">Descripción</label>
                  <textarea
                    className="w-full rounded-lg bg-[#0f1113] ring-1 ring-stone-800 px-2 py-1 text-sm text-zinc-100 resize-none"
                    rows={2}
                    value={description}
                    onChange={e => setDraft(p.id, { description: e.target.value })}
                    placeholder="Descripción del producto"
                  />
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
                    <label className="text-xs text-zinc-400">Precio (Pesos Colombianos)</label>
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

                  <div>
                    <label className="text-xs text-zinc-400">Puffs</label>
                    <input
                      type="number"
                      className="w-full rounded-lg bg-[#0f1113] ring-1 ring-stone-800 px-2 py-1 text-sm text-zinc-100"
                      value={puffs}
                      onChange={e => setDraft(p.id, { puffs: Math.max(0, Number(e.target.value)) })}
                      placeholder="5000"
                    />
                  </div>

                  {/* Mililitros */}
                  <div>
                    <label className="text-xs text-zinc-400">Mililitros (ml)</label>
                    <input
                      type="number"
                      className="w-full rounded-lg bg-[#0f1113] ring-1 ring-stone-800 px-2 py-1 text-sm text-zinc-100"
                      value={ml}
                      onChange={e => setDraft(p.id, { ml: Math.max(0, Number(e.target.value)) })}
                      placeholder="10"
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

                  {/* NUEVO: Toggle de sabores */}
                  <div className="flex items-center gap-2">
                    <input
                      id={`hasFlavors-${p.id}`}
                      type="checkbox"
                      className="accent-sky-400"
                      checked={!!hasFlavors}
                      onChange={e => {
                        const checked = e.target.checked;
                        setDraft(p.id, {
                          hasFlavors: checked,
                          ...(checked ? {} : { flavorsCSV: "" })
                        });
                      }}
                    />
                    <label htmlFor={`hasFlavors-${p.id}`} className="text-xs text-zinc-400">
                      Producto con sabores
                    </label>
                  </div>

                  {/* Sabores (solo si hasFlavors) */}
                  {hasFlavors && (
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
                  )}

                  <div className="flex items-center gap-2">
                    <input
                      id={`visible-${p.id}`}
                      type="checkbox"
                      className="accent-emerald-400"
                      checked={(d.visible ?? p.visible) ?? true}
                      onChange={e => setDraft(p.id, { visible: e.target.checked })}
                    />
                    <label htmlFor={`visible-${p.id}`} className="text-xs text-zinc-400">Visible</label>
                  </div>

                  {/* PLUS: selección por checkboxes */}
                  <div className="sm:col-span-2 lg:col-span-4">
                    <label className="text-xs text-zinc-400">Pluses</label>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {pluses.map(pl => {
                        const checked = assignedPluses.includes(pl.name);
                        return (
                          <label key={pl.id} className="inline-flex items-center gap-2 rounded-md bg-[#0f1113] ring-1 ring-stone-800 px-2 py-1 text-xs text-zinc-100">
                            <input
                              type="checkbox"
                              className="accent-sky-400"
                              checked={checked}
                              onChange={() =>
                                setDraft(p.id, { pluses: toggleString(assignedPluses, pl.name) })
                              }
                            />
                            {pl.name}
                          </label>
                        );
                      })}
                      {pluses.length === 0 && (
                        <span className="text-xs text-zinc-500">No hay pluses. Crea algunos en el botón “Pluses”.</span>
                      )}
                    </div>
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
        <div className="fixed inset-0 z-50 bg-black/50 flex items-stretch justify-center p-0 sm:items-center sm:p-3">
          <div className="w-full h-full sm:h-auto sm:max-w-lg bg-[#1a1d1f] border border-stone-800 sm:rounded-2xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-stone-800 sticky top-0 bg-[#1a1d1f]">
              <h2 className="text-lg font-semibold text-zinc-100">Nuevo producto</h2>
              <button
                className="text-sm rounded-lg bg-[#2a2a28] border border-stone-700 px-2 py-1 text-zinc-200 hover:bg-[#323230]"
                onClick={() => { setShowCreate(false); resetForm(); }}
                aria-label="Cerrar modal crear producto"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-4 py-4 max-h-[90vh] sm:max-h-[70vh]">
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

                {/* Descripción */}
                <div className="sm:col-span-2">
                  <label className="text-xs text-zinc-400">Descripción</label>
                  <textarea
                    className="w-full rounded-lg bg-[#0f1113] ring-1 ring-stone-800 px-2 py-1 text-sm text-zinc-100 resize-y"
                    rows={3}
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Describe el producto brevemente..."
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
                  <label className="text-xs text-zinc-400">Puffs</label>
                  <input
                    type="number"
                    className="w-full rounded-lg bg-[#0f1113] ring-1 ring-stone-800 px-2 py-1 text-sm text-zinc-100"
                    value={form.puffs}
                    onChange={e => setForm(f => ({ ...f, puffs: Math.max(0, Number(e.target.value)) }))}
                    placeholder="5000"
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400">Mililitros (ml)</label>
                  <input
                    type="number"
                    className="w-full rounded-lg bg-[#0f1113] ring-1 ring-stone-800 px-2 py-1 text-sm text-zinc-100"
                    value={form.ml}
                    onChange={e => setForm(f => ({ ...f, ml: Math.max(0, Number(e.target.value)) }))}
                    placeholder="10"
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

                {/* NUEVO: Toggle de sabores (crear) */}
                <div className="flex items-center gap-2">
                  <input
                    id="hasFlavors"
                    type="checkbox"
                    className="accent-sky-400"
                    checked={form.hasFlavors}
                    onChange={e => setForm(f => ({
                      ...f,
                      hasFlavors: e.target.checked,
                      ...(e.target.checked ? {} : { flavorsCSV: "" })
                    }))}
                  />
                  <label htmlFor="hasFlavors" className="text-xs text-zinc-400">Producto con sabores</label>
                </div>

                {form.hasFlavors && (
                  <div className="sm:col-span-2">
                    <label className="text-xs text-zinc-400">Sabores (separados por coma)</label>
                    <input
                      className="w-full rounded-lg bg-[#0f1113] ring-1 ring-stone-800 px-2 py-1 text-sm text-zinc-100"
                      value={form.flavorsCSV}
                      onChange={e => setForm(f => ({ ...f, flavorsCSV: e.target.value }))}
                      placeholder="Uva, Menta, Sandía"
                    />
                  </div>
                )}

                {/* Pluses */}
                <div className="sm:col-span-2">
                  <label className="text-xs text-zinc-400">Pluses</label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {pluses.map(pl => {
                      const checked = form.pluses.includes(pl.name);
                      return (
                        <label key={pl.id} className="inline-flex items-center gap-2 rounded-md bg-[#0f1113] ring-1 ring-stone-800 px-2 py-1 text-xs text-zinc-100">
                          <input
                            type="checkbox"
                            className="accent-sky-400"
                            checked={checked}
                            onChange={() =>
                              setForm(f => ({ ...f, pluses: toggleString(f.pluses, pl.name) }))
                            }
                          />
                          {pl.name}
                        </label>
                      );
                    })}
                    {pluses.length === 0 && (
                      <span className="text-xs text-zinc-500">No hay pluses. Crea algunos en el botón “Pluses”.</span>
                    )}
                  </div>
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
                    <img
                      src={imagePreview}
                      alt="preview"
                      className="mt-2 h-24 w-24 object-cover rounded-lg ring-1 ring-stone-800"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Footer fijo */}
            <div className="px-4 py-3 border-t border-stone-800 sticky bottom-0 bg-[#1a1d1f]">
              <div className="flex justify-end gap-2">
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
        </div>
      )}

            {showBanner && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-3">
          <div className="w-full max-w-2xl rounded-2xl border border-stone-800 bg-[#1a1d1f] p-5">

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-zinc-100">Banner de la semana</h2>
              <button
                className="text-sm rounded-lg bg-[#2a2a28] border border-stone-700 px-2 py-1 text-zinc-200 hover:bg-[#323230]"
                onClick={() => setShowBanner(false)}
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">

              {weekDays.map((day) => {
                const selectedCat = bannerCategory[day] ?? "";
                const filteredProducts = items.filter(p => p.category === selectedCat);

                return (
                  <div key={day} className="rounded-xl border border-stone-800 p-4 bg-[#0f1113]">
                    <h3 className="text-sm text-zinc-200 font-semibold mb-2">{day}</h3>

                    {/* Select Categoría */}
                    <div className="mb-2">
                      <label className="text-xs text-zinc-400">Categoría</label>
                      <select
                        className="w-full rounded-lg bg-[#1a1d1f] ring-1 ring-stone-800 px-2 py-1 text-sm text-zinc-100"
                        value={selectedCat}
                        onChange={(e) =>
                          setBannerCategory(prev => ({ ...prev, [day]: e.target.value }))
                        }
                      >
                        <option value="">— Selecciona categoría —</option>
                        {cats.map(c => (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Select Producto filtrado por categoría */}
                    <div>
                      <label className="text-xs text-zinc-400">Vape del día</label>
                      <select
                        className="w-full rounded-lg bg-[#1a1d1f] ring-1 ring-stone-800 px-2 py-1 text-sm text-zinc-100"
                        value={bannerVape[day] ?? ""}
                        onChange={(e) =>
                          setBannerVape(prev => ({ ...prev, [day]: e.target.value }))
                        }
                        disabled={!selectedCat}
                      >
                        <option value="">— Selecciona vape —</option>

                        {filteredProducts.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.sku})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })}

            </div>

            {/* Botón Guardar */}
            <div className="mt-4 flex justify-end">
              <button
                className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-sm text-white"
                onClick={async () => {
                  try {
                    const base = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";

                    // Construimos el cuerpo como lo espera el backend
                    const body = {
                      Lunes: bannerCategory["Lunes"]
                        ? {
                            category: bannerCategory["Lunes"],
                            vapeId: bannerVape["Lunes"],
                          }
                        : null,

                      Martes: bannerCategory["Martes"]
                        ? {
                            category: bannerCategory["Martes"],
                            vapeId: bannerVape["Martes"],
                          }
                        : null,

                      Miércoles: bannerCategory["Miércoles"]
                        ? {
                            category: bannerCategory["Miércoles"],
                            vapeId: bannerVape["Miércoles"],
                          }
                        : null,

                      Jueves: bannerCategory["Jueves"]
                        ? {
                            category: bannerCategory["Jueves"],
                            vapeId: bannerVape["Jueves"],
                          }
                        : null,

                      Viernes: bannerCategory["Viernes"]
                        ? {
                            category: bannerCategory["Viernes"],
                            vapeId: bannerVape["Viernes"],
                          }
                        : null,

                      Sábado: bannerCategory["Sábado"]
                        ? {
                            category: bannerCategory["Sábado"],
                            // vapeId: bannerVape["Sábado"],
                          }
                        : null,

                      Domingo: bannerCategory["Domingo"]
                        ? {
                            category: bannerCategory["Domingo"],
                            vapeId: bannerVape["Domingo"],
                          }
                        : null,
                    };

                    console.log("ENVIANDO AL BACKEND =>", body);

                    const res = await fetch(`${base}/banner`, {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(body),
                    });

                    if (!res.ok) {
                      toast.error("Error de servidor al guardar el banner");
                      return;
                    }
                    alert("voy a enviar");
                    toast.success("Banner guardado correctamente");
                    setShowBanner(false);
                  } catch (err) {
                    console.error(err);
                    toast.error("No se pudo guardar el banner");
                  }
                }}
              >
                Guardar banner
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
                {catsOrdered.map((c) => {
                  const draftFile = catDrafts[c.id]?.imageFile; // Obtener el archivo en borrador
                  
                  return (
                  <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 px-3 py-2">
                    {/* Información, Imagen y Home Order */}
                    <div className="flex items-center gap-3 min-w-0">
                      
                      {/* 🚨 CAMBIO 3: Imagen y selector de archivo (guarda en borrador) */}
                      <label className="relative" title="Cambiar imagen de categoría">
                        <img
                            // Usar el archivo en borrador para la previsualización, sino la URL existente
                            src={draftFile ? URL.createObjectURL(draftFile) : c.imageUrl || `https://picsum.photos/seed/${c.id}/40`} 
                            className="h-10 w-10 object-cover rounded-md ring-1 ring-stone-800 cursor-pointer"
                            alt={c.name}
                        />
                        {/* Selector de archivo OCULTO para la imagen */}
                        <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={e => {
                                const file = e.target.files?.[0];
                                if (!file) return;

                                // Guarda el archivo en el estado de borrador (catDrafts)
                                setCatDraft(c.id, { imageFile: file });
                                
                                // Resetear el input para permitir subir el mismo archivo si se cancela
                                e.target.value = ''; 
                            }}
                        />
                      </label>

                      <input
                        type="number"
                        className="w-16 rounded-lg bg-[#0f1113] ring-1 ring-stone-800 px-2 py-1 text-xs text-zinc-100"
                        value={c.homeOrder ?? 1000}
                        onChange={e => {
                          const val = Number(e.target.value);
                          setCats(prev => prev.map(x => x.id === c.id ? { ...x, homeOrder: val } : x));
                        }}
                        title="Orden en Home (menor sale primero)"
                      />
                      <span className="text-sm text-zinc-100 truncate">{c.name}</span>
                    </div>
                    
                    {/* Botones de acción */}
                    <div className="flex items-center gap-2">
                      <button
                        className="rounded-md bg-amber-600 hover:bg-amber-700 px-2 py-1 text-xs text-white"
                        // 🚨 CAMBIO 4: Lógica para guardar orden E imagen al hacer clic
                        onClick={async () => {
                          const draftFile = catDrafts[c.id]?.imageFile;
                          
                          try {
                            // 1. GUARDAR ORDEN
                            const updatedOrder = await patchCategory(c.id, { homeOrder: c.homeOrder ?? 1000 });

                            // 2. GUARDAR IMAGEN SI HAY BORRADOR
                            let finalCategory = updatedOrder;
                            if (draftFile) {
                                toast.info("Subiendo imagen de categoría...");
                                // ⚠️ Llamada a la nueva función de servicio (patchCategoryImage)
                                finalCategory = await patchCategoryImage(c.id, draftFile);
                            }

                            // 3. ACTUALIZAR ESTADO LOCAL Y LIMPIAR BORRADOR
                            setCats(prev => prev.map(x => x.id === c.id ? finalCategory : x));
                            setCatDrafts(prev => {
                                const next = { ...prev };
                                delete next[c.id]; // Limpiar borrador de imagen
                                return next;
                            });

                            // 4. CAMBIO: Mensaje de éxito
                            toast.success("Cambios guardados");
                          } catch (error) {
                            console.error(error);
                            // 5. CAMBIO: Mensaje de error
                            toast.error("No se pudieron guardar los cambios");
                            
                            // Si falla, recargar para revertir la imagen temporal si existía
                            if (draftFile) {
                                void loadCategories(); 
                            }
                          }
                        }}
                      >
                        {/* 6. CAMBIO: Texto del botón */}
                        Guardar Cambios 
                      </button>
                      <button
                        className="rounded-md bg-red-600 hover:bg-red-700 px-2 py-1 text-xs text-white"
                        onClick={() => void onDeleteCategory(c.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </li>
                );
                })}
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

      {/* Modal pluses */}
      {showPluses && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-3">
          <div className="w-full max-w-lg rounded-2xl border border-stone-800 bg-[#1a1d1f] p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-zinc-100">Pluses</h2>
              <button
                className="text-sm rounded-lg bg-[#2a2a28] border border-stone-700 px-2 py-1 text-zinc-200 hover:bg-[#323230]"
                onClick={() => setShowPluses(false)}
              >
                ✕
              </button>
            </div>

            <div className="mb-3">
              <label className="text-xs text-zinc-400">Nuevo plus</label>
              <div className="flex gap-2">
                <input
                  className="flex-1 rounded-lg bg-[#0f1113] ring-1 ring-stone-800 px-2 py-1 text-sm text-zinc-100"
                  value={newPlus}
                  onChange={e => setNewPlus(e.target.value)}
                  placeholder="Batería extra, Edición limitada…"
                />
                <button
                  className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-sm text-white"
                  onClick={() => void onCreatePlus()}
                  disabled={plusesLoading}
                >
                  Crear
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-stone-800 overflow-hidden">
              <div className="bg-[#0f1113] px-3 py-2 text-xs text-zinc-400">
                {plusesLoading ? "Cargando pluses…" : `Total: ${pluses.length}`}
              </div>
              <ul className="max-h-72 overflow-auto divide-y divide-stone-800">
                {pluses.map(pl => (
                  <li key={pl.id} className="flex items-center justify-between px-3 py-2">
                    <span className="text-sm text-zinc-100">{pl.name}</span>
                    <button
                      className="rounded-md bg-red-600 hover:bg-red-700 px-2 py-1 text-xs text-white"
                      onClick={() => void onDeletePlus(pl.id)}
                    >
                      Eliminar
                    </button>
                  </li>
                ))}
                {pluses.length === 0 && !plusesLoading && (
                  <li className="px-3 py-3 text-sm text-zinc-400">No hay pluses</li>
                )}
              </ul>
            </div>

            <div className="mt-3 text-right">
              <button
                className="rounded-lg bg-[#2a2a28] border border-stone-700 px-3 py-1.5 text-sm text-zinc-200 hover:bg-[#323230]"
                onClick={() => setShowPluses(false)}
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