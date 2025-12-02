// =========================
// AdminDashboard.tsx LIMPIO
// =========================

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
  getCategories,
  createCategory,
  deleteCategoryById,
  patchCategory,
  type AdminCategory,
  getPluses,
  createPlus,
  deletePlusById,
  type AdminPlus,
} from "../services/admin";

import { patchBannerData } from "../services/banner_services";



const toArray = (v: string): string[] =>
  v.split(",").map(s => s.trim()).filter(Boolean);
const fromArray = (arr?: string[]): string => (arr ?? []).join(", ");

const fmt = (cents: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0
  }).format((cents || 0));

type Drafts = Record<
  string,
  Partial<AdminProduct> & {
    flavorsCSV?: string;
    pluses?: string[];
    hasFlavors?: boolean;
  }
>;

function toggleString(arr: readonly string[], value: string): string[] {
  return arr.includes(value)
    ? arr.filter(v => v !== value)
    : [...arr, value];
}

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [items, setItems] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // ===== Categorías =====
  const [cats, setCats] = useState<AdminCategory[]>([]);
  const [catsLoading, setCatsLoading] = useState(false);
  const [showCats, setShowCats] = useState(false);
  const [newCat, setNewCat] = useState("");
  const filteredItems = items.filter((p) =>
  p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  p.sku.toLowerCase().includes(searchTerm.toLowerCase())
);


  const catsOrdered = useMemo(
    () =>
      [...cats].sort(
        (a, b) =>
          (a.homeOrder ?? 1000) - (b.homeOrder ?? 1000) ||
          a.name.localeCompare(b.name, "es")
      ),
    [cats]
  );

  // ===== Pluses =====
  const [pluses, setPluses] = useState<AdminPlus[]>([]);
  const [plusesLoading, setPlusesLoading] = useState(false);
  const [showPluses, setShowPluses] = useState(false);
  const [newPlus, setNewPlus] = useState("");

  // ===== Crear producto =====
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
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
    pluses: [] as string[],
    image: null as File | null
  });

  const imagePreview = useMemo(
    () => (form.image ? URL.createObjectURL(form.image) : ""),
    [form.image]
  );

  const resetForm = () =>
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
      image: null
    });

  // ===== Borradores =====
  const [drafts, setDrafts] = useState<Drafts>({});
  const setDraft = (id: string, patch: Drafts[string]) =>
    setDrafts(prev => ({
      ...prev,
      [id]: { ...(prev[id] ?? {}), ...patch }
    }));

  // ===== Banner (SIN IMÁGENES) =====
  const [showBanner, setShowBanner] = useState(false);

  const [bannerCategory, setBannerCategory] = useState<Record<string, string>>({});
  const [bannerVape, setBannerVape] = useState<Record<string, string>>({});
  const [bannerDiscount, setBannerDiscount] = useState<Record<string, number>>({});

type BannerDays =
  | "Lunes"
  | "Martes"
  | "Miércoles"
  | "Jueves"
  | "Viernes"
  | "Sábado"
  | "Domingo";
  
  const weekDays: BannerDays[] = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

  const loadBanner = async () => {
    try {
      const data = await getBanner();
      if (!data) return;

      const catsObj: Record<string, string> = {};
      const vapeObj: Record<string, string> = {};
      const discountObj: Record<string, number> = {};

      for (const day of weekDays) {
        catsObj[day] = data[day]?.category ?? "";
        vapeObj[day] = data[day]?.vapeId ?? "";
        discountObj[day] = data[day]?.descuento ?? 0;

      }
      setBannerDiscount(discountObj);
      setBannerCategory(catsObj);
      setBannerVape(vapeObj);
    } catch (err) {
      console.error("Error cargando banner:", err);
    }
  };

  const onSaveBanner = async () => {
    const toastId = toast.loading("Guardando banner...");

    try {
      const body = {
        Lunes: bannerCategory["Lunes"]
          ? {
              category: bannerCategory["Lunes"],
              vapeId: bannerVape["Lunes"],
              descuento: bannerDiscount["Lunes"]
            }
          : null,
        Martes: bannerCategory["Martes"]
          ? {
              category: bannerCategory["Martes"],
              vapeId: bannerVape["Martes"],
              descuento: bannerDiscount["Martes"]
              
            }
          : null,
        Miércoles: bannerCategory["Miércoles"]
          ? {
              category: bannerCategory["Miércoles"],
              vapeId: bannerVape["Miércoles"],
              descuento: bannerDiscount["Miércoles"]
            }
          : null,
        Jueves: bannerCategory["Jueves"]
          ? {
              category: bannerCategory["Jueves"],
              vapeId: bannerVape["Jueves"],
              descuento: bannerDiscount["Jueves"]
            }
          : null,
        Viernes: bannerCategory["Viernes"]
          ? {
              category: bannerCategory["Viernes"],
              vapeId: bannerVape["Viernes"],
              descuento: bannerDiscount["Viernes"]
            }
          : null,
        Sábado: bannerCategory["Sábado"]
          ? {
              category: bannerCategory["Sábado"],
              vapeId: bannerVape["Sábado"],
              descuento: bannerDiscount["Sábado"]
            }
          : null,
        Domingo: bannerCategory["Domingo"]
          ? {
              category: bannerCategory["Domingo"],
              vapeId: bannerVape["Domingo"],
              descuento: bannerDiscount["Domingo"]
            }
          : null
      };

      await patchBannerData(body);

      toast.success("Banner guardado correctamente.", { id: toastId });
      setShowBanner(false);
    } catch  {
      toast.error("Error guardando banner", { id: toastId });
    }
  };

  // ===== LOADERS =====
  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setItems(data);
      
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      setCatsLoading(true);
      const data = await getCategories();
      setCats(data);
      
    } finally {
      setCatsLoading(false);
    }
  };

  const loadPluses = async () => {
    try {
      setPlusesLoading(true);
      const data = await getPluses();
      setPluses(data);
    } finally {
      setPlusesLoading(false);
    }
  };

  useEffect(() => void loadProducts(), []);
  useEffect(() => void loadCategories(), []);
  useEffect(() => void loadPluses(), []);
  useEffect(() => void loadBanner(), []);

  // ===== update image =====
  const updateImage = async (id: string, file: File) => {
    try {
      const tempUrl = URL.createObjectURL(file);
      setItems(prev =>
        prev.map(p => (p.id === id ? { ...p, imageUrl: tempUrl } : p))
      );

      const updated = await patchProductImage(id, file);
      setItems(prev =>
        prev.map(p => (p.id === id ? updated : p))
      );
      toast.success("Imagen actualizada");
    } catch {
      toast.error("No se pudo actualizar la imagen");
      void loadProducts();
    }
  };

  // ===== save row =====
  const onSaveRow = async (id: string) => {
    const current = items.find(p => p.id === id);
    if (!current) return;

    const draft = drafts[id] ?? {};
    const merged: AdminProduct & {
      hasFlavors?: boolean;
      flavors?: string[];
    } = { ...current, ...draft };

    const categoryTrim = (merged.category ?? "").trim();
    const nextPluses = draft.pluses ?? merged.pluses ?? [];

    const hasFlavors: boolean =
      draft.hasFlavors ??
      (typeof merged.hasFlavors === "boolean"
        ? merged.hasFlavors
        : (merged.flavors?.length ?? 0) > 0);

    const nextFlavors = hasFlavors
      ? draft.flavorsCSV !== undefined
        ? toArray(draft.flavorsCSV)
        : merged.flavors ?? []
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
      pluses: nextPluses
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

  // ===== delete row =====
  const onDeleteRow = async (id: string) => {
    const p = items.find(x => x.id === id);
    if (!p) return;
    const ok = window.confirm(`¿Eliminar el producto "${p.name}"?`);
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
      toast.error("No se pudo eliminar");
    }
  };

  // ===== create product =====
  const onCreate = async () => {
    if (!form.sku.trim()) return toast.error("SKU obligatorio");
    if (!form.name.trim()) return toast.error("Nombre obligatorio");

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
        pluses: form.pluses
      });

      setItems(prev => [created, ...prev]);
      toast.success("Producto creado");
      setShowCreate(false);
      resetForm();
    } catch (e) {
      console.error(e);
      toast.error("No se pudo crear");
    }
  };

  // ===== create category =====
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
      toast.error("Error creando categoría");
    }
  };

  // ===== delete category =====
  const onDeleteCategory = async (id: string) => {
    const cat = cats.find(c => c.id === id);
    if (!cat) return;

    const ok = window.confirm(`¿Eliminar "${cat.name}"?`);
    if (!ok) return;

    try {
      await deleteCategoryById(id);
      setCats(prev => prev.filter(c => c.id !== id));
      setForm(f =>
        f.category === cat.name ? { ...f, category: "" } : f
      );
      toast.success("Categoría eliminada");
    } catch (e) {
      console.error(e);
      toast.error("Error eliminando categoría");
    }
  };

  // ===== create plus =====
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
      toast.error("Error creando plus");
    }
  };

  // ===== delete plus =====
  const onDeletePlus = async (id: string) => {
    const pl = pluses.find(p => p.id === id);
    if (!pl) return;

    const ok = window.confirm(`¿Eliminar "${pl.name}"?`);
    if (!ok) return;

    try {
      await deletePlusById(id);
      setPluses(prev => prev.filter(p => p.id !== id));
      setForm(f => ({
        ...f,
        pluses: f.pluses.filter(n => n !== pl.name)
      }));
      toast.success("Plus eliminado");
    } catch (e) {
      console.error(e);
      toast.error("Error eliminando plus");
    }
  };
// ====================================  
  // RENDER
  // ====================================  
  return (
    <div className="px-3 sm:px-4 md:px-6 py-6">

      {/* HEADER */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl sm:text-2xl font-bold text-zinc-100">
          Panel de administración
        </h1>

       <div className="p-6 w-full max-w-sm">
        <input
          type="text"
          placeholder="Buscar productos..."
          className="px-3 py-2 bg-[#1a1d1f] text-white rounded-xl w-full mb-4"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
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
            onClick={() => {
              localStorage.removeItem("admin_token");
              location.href = "/";
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </div>
      

      {/* LISTA DE PRODUCTOS */}
      <div className="space-y-3">
        {loading ? (
          <div className="rounded-2xl border border-stone-800 bg-[#1a1d1f] p-6 text-zinc-400">
            Cargando…
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-stone-800 bg-[#1a1d1f] p-6 text-zinc-400">
            Sin productos
          </div>
        ) : (
          filteredItems.map(p => {
            const d = drafts[p.id] ?? {};

            const name = d.name ?? p.name;
            const sku = (d.sku ?? p.sku) ?? "";
            const price = Math.round(d.price ?? p.price ?? 0);
            const stock = Math.round(d.stock ?? p.stock ?? 0);
            const puffs = Math.round(d.puffs ?? p.puffs ?? 0);
            const ml = Math.round(d.ml ?? p.ml ?? 0);
            const category = (d.category ?? p.category) ?? "";
            const description = d.description ?? p.description ?? "";

            const inferredHasFlavors = p.hasFlavors as boolean | undefined;
            const hasFlavors =
              d.hasFlavors ??
              (typeof inferredHasFlavors === "boolean"
                ? inferredHasFlavors
                : (p.flavors?.length ?? 0) > 0);
            const flavorsCSV =
              d.flavorsCSV ?? fromArray(d.flavors ?? p.flavors);

            const assignedPluses: string[] = d.pluses ?? p.pluses ?? [];

            return (
              <div
                key={p.id}
                className="rounded-2xl border border-stone-800 bg-[#1a1d1f] p-4"
              >
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
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) void updateImage(p.id, file);
                        }}
                      />
                    </label>

                    <div className="flex-1 min-w-0">
                      <input
                        className="w-full rounded-lg bg-[#0f1113] ring-1 ring-stone-800 px-2 py-1 text-sm text-zinc-100"
                        value={name}
                        onChange={e =>
                          setDraft(p.id, { name: e.target.value })
                        }
                      />
                      <div className="text-[11px] text-zinc-500 truncate">
                        ID: {p.id}
                      </div>
                    </div>
                  </div>

                  <div className="hidden sm:flex gap-2 sm:ml-auto">
                    <button
                      className="rounded-lg bg-amber-600 hover:bg-amber-700 px-3 py-1.5 text-sm text-white"
                      onClick={() => void onSaveRow(p.id)}
                    >
                      Actualizar
                    </button>
                    <button
                      className="rounded-lg bg-red-600 hover:bg-red-700 px-3 py-1.5 text-sm text-white"
                      onClick={() => void onDeleteRow(p.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>

                {/* Descripción */}
                <div className="mt-3">
                  <label className="text-xs text-zinc-400">Descripción</label>
                  <textarea
                    rows={2}
                    className="w-full rounded-lg bg-[#0f1113] ring-1 ring-stone-800 px-2 py-1 text-sm text-zinc-100 resize-none"
                    value={description}
                    onChange={e =>
                      setDraft(p.id, {
                        description: e.target.value
                      })
                    }
                  />
                </div>

                {/* Campos */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* SKU */}
                  <div>
                    <label className="text-xs text-zinc-400">SKU</label>
                    <input
                      className="w-full rounded-lg bg-[#0f1113] ring-1 ring-stone-800 px-2 py-1 text-sm text-zinc-100 uppercase"
                      value={sku}
                      onChange={e =>
                        setDraft(p.id, {
                          sku: e.target.value.toUpperCase()
                        })
                      }
                    />
                  </div>

                  {/* Precio */}
                  <div>
                    <label className="text-xs text-zinc-400">
                      Precio (COP)
                    </label>
                    <input
                      type="number"
                      className="w-full rounded-lg bg-[#0f1113] ring-1 ring-stone-800 px-2 py-1 text-sm text-zinc-100"
                      value={price}
                      onChange={e =>
                        setDraft(p.id, {
                          price: Math.max(0, Number(e.target.value))
                        })
                      }
                    />
                    <div className="text-[11px] text-zinc-500">
                      {fmt(price)}
                    </div>
                  </div>

                  {/* Stock */}
                  <div>
                    <label className="text-xs text-zinc-400">Stock</label>
                    <input
                      type="number"
                      className="w-full rounded-lg bg-[#0f1113] ring-1 ring-stone-800 px-2 py-1 text-sm text-zinc-100"
                      value={stock}
                      onChange={e =>
                        setDraft(p.id, {
                          stock: Math.max(0, Number(e.target.value))
                        })
                      }
                    />
                  </div>

                  {/* Puffs */}
                  <div>
                    <label className="text-xs text-zinc-400">Puffs</label>
                    <input
                      type="number"
                      className="w-full rounded-lg bg-[#0f1113] ring-1 ring-stone-800 px-2 py-1 text-sm text-zinc-100"
                      value={puffs}
                      onChange={e =>
                        setDraft(p.id, {
                          puffs: Math.max(0, Number(e.target.value))
                        })
                      }
                    />
                  </div>

                  {/* ml */}
                  <div>
                    <label className="text-xs text-zinc-400">ml</label>
                    <input
                      type="number"
                      className="w-full rounded-lg bg-[#0f1113] ring-1 ring-stone-800 px-2 py-1 text-sm text-zinc-100"
                      value={ml}
                      onChange={e =>
                        setDraft(p.id, {
                          ml: Math.max(0, Number(e.target.value))
                        })
                      }
                    />
                  </div>

                  {/* Categoría */}
                  <div>
                    <label className="text-xs text-zinc-400">Categoría</label>
                    <select
                      className="w-full rounded-lg bg-[#0f1113] ring-1 ring-stone-800 px-2 py-1 text-sm text-zinc-100"
                      value={category}
                      onChange={e =>
                        setDraft(p.id, {
                          category: e.target.value
                        })
                      }
                    >
                      <option value="">— Selecciona —</option>
                      {cats.map(c => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Toggle sabores */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="accent-sky-400"
                      checked={!!hasFlavors}
                      onChange={e =>
                        setDraft(p.id, {
                          hasFlavors: e.target.checked,
                          ...(e.target.checked
                            ? {}
                            : { flavorsCSV: "" })
                        })
                      }
                    />
                    <label className="text-xs text-zinc-400">
                      Producto con sabores
                    </label>
                  </div>

                  {/* Sabores */}
                  {hasFlavors && (
                    <div className="lg:col-span-2">
                      <label className="text-xs text-zinc-400">
                        Sabores (coma)
                      </label>
                      <input
                        className="w-full rounded-lg bg-[#0f1113] ring-1 ring-stone-800 px-2 py-1 text-sm text-zinc-100"
                        value={flavorsCSV}
                        onChange={e =>
                          setDraft(p.id, {
                            flavorsCSV: e.target.value
                          })
                        }
                      />
                    </div>
                  )}

                  {/* Visible */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="accent-emerald-400"
                      checked={(d.visible ?? p.visible) ?? true}
                      onChange={e =>
                        setDraft(p.id, {
                          visible: e.target.checked
                        })
                      }
                    />
                    <label className="text-xs text-zinc-400">
                      Visible
                    </label>
                  </div>

                  {/* Pluses */}
                  <div className="sm:col-span-2 lg:col-span-4">
                    <label className="text-xs text-zinc-400">Pluses</label>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {pluses.map(pl => {
                        const checked = assignedPluses.includes(pl.name);
                        return (
                          <label
                            key={pl.id}
                            className="inline-flex items-center gap-2 rounded-md bg-[#0f1113] ring-1 ring-stone-800 px-2 py-1 text-xs text-zinc-100"
                          >
                            <input
                              type="checkbox"
                              className="accent-sky-400"
                              checked={checked}
                              onChange={() =>
                                setDraft(p.id, {
                                  pluses: toggleString(
                                    assignedPluses,
                                    pl.name
                                  )
                                })
                              }
                            />
                            {pl.name}
                          </label>
                        );
                      })}
                      {pluses.length === 0 && (
                        <span className="text-xs text-zinc-500">
                          No hay pluses
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Botones móviles */}
                <div className="mt-4 flex flex-col sm:hidden gap-2">
                  <button
                    className="rounded-lg bg-amber-600 hover:bg-amber-700 px-3 py-2 text-sm text-white"
                    onClick={() => void onSaveRow(p.id)}
                  >
                    Actualizar
                  </button>
                  <button
                    className="rounded-lg bg-red-600 hover:bg-red-700 px-3 py-2 text-sm text-white"
                    onClick={() => void onDeleteRow(p.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* FOOTER INFO */}
      <p className="mt-4 text-xs text-zinc-500">
        Edita los campos y presiona{" "}
        <span className="text-amber-400 font-medium">
          “Actualizar producto”
        </span>{" "}
        para guardar los cambios.
      </p>

      {/* MODAL CREATE PRODUCT */}
      {showCreate && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-stretch justify-center p-0 sm:items-center sm:p-3">
          <div className="w-full h-full sm:h-auto sm:max-w-lg bg-[#1a1d1f] border border-stone-800 sm:rounded-2xl flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-stone-800 sticky top-0 bg-[#1a1d1f]">
              <h2 className="text-lg font-semibold text-zinc-100">
                Nuevo producto
              </h2>
              <button
                className="text-sm rounded-lg bg-[#2a2a28] border border-stone-700 px-2 py-1 text-zinc-200 hover:bg-[#323230]"
                onClick={() => {
                  setShowCreate(false);
                  resetForm();
                }}
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 max-h-[90vh] sm:max-h-[70vh]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Nombre */}
                <div className="sm:col-span-2">
                  <label className="text-xs text-zinc-400">Nombre</label>
                  <input
                    className="w-full rounded-lg bg-[#0f1113] ring-1 ring-stone-800 px-2 py-1 text-sm text-zinc-100"
                    value={form.name}
                    onChange={e =>
                      setForm(f => ({ ...f, name: e.target.value }))
                    }
                  />
                </div>

                {/* Descripción */}
                <div className="sm:col-span-2">
                  <label className="text-xs text-zinc-400">
                    Descripción
                  </label>
                  <textarea
                    rows={3}
                    className="w-full rounded-lg bg-[#0f1113] ring-1 ring-stone-800 px-2 py-1 text-sm text-zinc-100 resize-y"
                    value={form.description}
                    onChange={e =>
                      setForm(f => ({ ...f, description: e.target.value }))
                    }
                  />
                </div>

                {/* Precio */}
                <div>
                  <label className="text-xs text-zinc-400">
                    Precio (centavos)
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-lg bg-[#0f1113] ring-1 ring-stone-800 px-2 py-1 text-sm text-zinc-100"
                    value={form.price}
                    onChange={e =>
                      setForm(f => ({
                        ...f,
                        price: Math.max(0, Number(e.target.value))
                      }))
                    }
                  />
                  <div className="text-[11px] text-zinc-500">
                    {fmt(form.price)}
                  </div>
                </div>

                {/* Stock */}
                <div>
                  <label className="text-xs text-zinc-400">Stock</label>
                  <input
                    type="number"
                    className="w-full rounded-lg bg-[#0f1113] ring-1 ring-stone-800 px-2 py-1 text-sm text-zinc-100"
                    value={form.stock}
                    onChange={e =>
                      setForm(f => ({
                        ...f,
                        stock: Math.max(0, Number(e.target.value))
                      }))
                    }
                  />
                </div>

                {/* Puffs */}
                <div>
                  <label className="text-xs text-zinc-400">Puffs</label>
                  <input
                    type="number"
                    className="w-full rounded-lg bg-[#0f1113] ring-1 ring-stone-800 px-2 py-1 text-sm text-zinc-100"
                    value={form.puffs}
                    onChange={e =>
                      setForm(f => ({
                        ...f,
                        puffs: Math.max(0, Number(e.target.value))
                      }))
                    }
                  />
                </div>

                {/* ml */}
                <div>
                  <label className="text-xs text-zinc-400">ml</label>
                  <input
                    type="number"
                    className="w-full rounded-lg bg-[#0f1113] ring-1 ring-stone-800 px-2 py-1 text-sm text-zinc-100"
                    value={form.ml}
                    onChange={e =>
                      setForm(f => ({
                        ...f,
                        ml: Math.max(0, Number(e.target.value))
                      }))
                    }
                  />
                </div>

                {/* SKU */}
                <div>
                  <label className="text-xs text-zinc-400">SKU</label>
                  <input
                    className="w-full rounded-lg bg-[#0f1113] ring-1 ring-stone-800 px-2 py-1 text-sm text-zinc-100 uppercase"
                    value={form.sku}
                    onChange={e =>
                      setForm(f => ({
                        ...f,
                        sku: e.target.value.toUpperCase()
                      }))
                    }
                  />
                </div>

                {/* Categoría */}
                <div>
                  <label className="text-xs text-zinc-400">Categoría</label>
                  <select
                    className="w-full rounded-lg bg-[#0f1113] ring-1 ring-stone-800 px-2 py-1 text-sm text-zinc-100"
                    value={form.category}
                    onChange={e =>
                      setForm(f => ({
                        ...f,
                        category: e.target.value
                      }))
                    }
                  >
                    <option value="">— Selecciona —</option>
                    {cats.map(c => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sabores */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="accent-sky-400"
                    checked={form.hasFlavors}
                    onChange={e =>
                      setForm(f => ({
                        ...f,
                        hasFlavors: e.target.checked,
                        ...(e.target.checked ? {} : { flavorsCSV: "" })
                      }))
                    }
                  />
                  <label className="text-xs text-zinc-400">
                    Producto con sabores
                  </label>
                </div>

                {form.hasFlavors && (
                  <div className="sm:col-span-2">
                    <label className="text-xs text-zinc-400">
                      Sabores (coma)
                    </label>
                    <input
                      className="w-full rounded-lg bg-[#0f1113] ring-1 ring-stone-800 px-2 py-1 text-sm text-zinc-100"
                      value={form.flavorsCSV}
                      onChange={e =>
                        setForm(f => ({
                          ...f,
                          flavorsCSV: e.target.value
                        }))
                      }
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
                        <label
                          key={pl.id}
                          className="inline-flex items-center gap-2 rounded-md bg-[#0f1113] ring-1 ring-stone-800 px-2 py-1 text-xs text-zinc-100"
                        >
                          <input
                            type="checkbox"
                            className="accent-sky-400"
                            checked={checked}
                            onChange={() =>
                              setForm(f => ({
                                ...f,
                                pluses: toggleString(
                                  f.pluses,
                                  pl.name
                                )
                              }))
                            }
                          />
                          {pl.name}
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Visible */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="accent-emerald-400"
                    checked={form.visible}
                    onChange={e =>
                      setForm(f => ({
                        ...f,
                        visible: e.target.checked
                      }))
                    }
                  />
                  <label className="text-xs text-zinc-400">Visible</label>
                </div>

                {/* Imagen */}
                <div className="sm:col-span-2">
                  <label className="text-xs text-zinc-400">Imagen</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e =>
                      setForm(f => ({
                        ...f,
                        image: e.target.files?.[0] || null
                      }))
                    }
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

            <div className="px-4 py-3 border-t border-stone-800 sticky bottom-0 bg-[#1a1d1f]">
              <div className="flex justify-end gap-2">
                <button
                  className="rounded-lg bg-[#2a2a28] border border-stone-700 px-3 py-1.5 text-sm text-zinc-200 hover:bg-[#323230]"
                  onClick={() => {
                    setShowCreate(false);
                    resetForm();
                  }}
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

      {/* ====================== */}
      {/* MODAL BANNER SIN IMAGEN */}
      {/* ====================== */}
      {showBanner && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-3">
          <div className="w-full max-w-2xl rounded-2xl border border-stone-800 bg-[#1a1d1f] p-5">

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-zinc-100">
                Banner de la semana
              </h2>
              <button
                className="text-sm rounded-lg bg-[#2a2a28] border border-stone-700 px-2 py-1 text-zinc-200 hover:bg-[#323230]"
                onClick={() => setShowBanner(false)}
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">

              {/* Título */}
              <div className="border-t border-stone-800 pt-4">
                <h3 className="text-sm text-zinc-400 font-semibold mb-3">
                  Configuración por día
                </h3>
              </div>

              {/* Configuración por día */}
              {weekDays.map(day => {
                const selectedCat = bannerCategory[day] ?? "";
                const filteredProducts = items.filter(
                  p => p.category === selectedCat
                );

                return (
                  <div
                    key={day}
                    className="rounded-xl border border-stone-800 p-4 bg-[#0f1113]"
                  >
                    <h3 className="text-sm text-zinc-200 font-semibold mb-2">
                      {day}
                    </h3>

                    {/* Categoría */}
                    <div className="mb-2">
                      <label className="text-xs text-zinc-400">
                        Categoría
                      </label>
                      <select
                        className="w-full rounded-lg bg-[#1a1d1f] ring-1 ring-stone-800 px-2 py-1 text-sm text-zinc-100"
                        value={selectedCat}
                        onChange={e =>
                          setBannerCategory(prev => ({
                            ...prev,
                            [day]: e.target.value
                          }))
                        }
                      >
                        <option value="">— Selecciona —</option>
                        {cats.map(c => (
                          <option key={c.id} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Vape */}
                    <div>
                      <label className="text-xs text-zinc-400">
                        Vape del día
                      </label>
                      <select
                        className="w-full rounded-lg bg-[#1a1d1f] ring-1 ring-stone-800 px-2 py-1 text-sm text-zinc-100"
                        value={bannerVape[day] ?? ""}
                        onChange={e =>
                          setBannerVape(prev => ({
                            ...prev,
                            [day]: e.target.value
                          }))
                        }
                        disabled={!selectedCat}
                      >
                        <option value="">— Selecciona —</option>
                        {filteredProducts.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.sku})
                          </option>
                        ))}
                      </select>
                       {/* 🔥 TU INPUT DE DESCUENTO AQUÍ MISMO */}
                    <div className="mt-2">
                      <label className="text-xs text-zinc-400">Descuento (%)</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        className="w-full rounded-lg bg-[#1a1d1f] ring-1 ring-stone-800 px-2 py-1 text-sm text-zinc-100"
                        value={bannerDiscount[day] ?? 0}
                        onChange={e =>
                          setBannerDiscount(prev => ({
                            ...prev,
                            [day]: Number(e.target.value)
                          }))
                        }
                      />
                    </div>
                    </div>
                  </div>
                  
                );
                
              })}
            </div>
            
              

            {/* Botón guardar */}
            <div className="mt-4 flex justify-end">
              <button
                className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-sm text-white"
                onClick={onSaveBanner}
              >
                Guardar banner
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CATEGORÍAS */}
      {showCats && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-3">
          <div className="w-full max-w-lg rounded-2xl border border-stone-800 bg-[#1a1d1f] p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-zinc-100">
                Categorías
              </h2>
              <button
                className="text-sm rounded-lg bg-[#2a2a28] border border-stone-700 px-2 py-1 text-zinc-200 hover:bg-[#323230]"
                onClick={() => setShowCats(false)}
              >
                ✕
              </button>
            </div>

            {/* Crear categoría */}
            <div className="mb-3">
              <label className="text-xs text-zinc-400">
                Nueva categoría
              </label>
              <div className="flex gap-2">
                <input
                  className="flex-1 rounded-lg bg-[#0f1113] ring-1 ring-stone-800 px-2 py-1 text-sm text-zinc-100"
                  value={newCat}
                  onChange={e => setNewCat(e.target.value)}
                  placeholder="desechables"
                />
                <button
                  className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-sm text-white"
                  onClick={onCreateCategory}
                  disabled={catsLoading}
                >
                  Crear
                </button>
              </div>
            </div>

            {/* Lista de categorías */}
            <div className="rounded-xl border border-stone-800 overflow-hidden">
              <div className="bg-[#0f1113] px-3 py-2 text-xs text-zinc-400">
                {catsLoading
                  ? "Cargando..."
                  : `Total: ${cats.length}`}
              </div>

              <ul className="max-h-72 overflow-auto divide-y divide-stone-800">
                {catsOrdered.map(c => (
                  <li
                    key={c.id}
                    className="flex flex-wrap items-center justify-between gap-3 px-3 py-2"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={
                          c.imageUrl ||
                          `https://picsum.photos/seed/${c.id}/40`
                        }
                        className="h-10 w-10 object-cover rounded-md ring-1 ring-stone-800"
                        alt={c.name}
                      />

                      <input
                        type="number"
                        className="w-16 rounded-lg bg-[#0f1113] ring-1 ring-stone-800 px-2 py-1 text-xs text-zinc-100"
                        value={c.homeOrder ?? 1000}
                        onChange={e => {
                          const val = Number(e.target.value);
                          setCats(prev =>
                            prev.map(x =>
                              x.id === c.id
                                ? { ...x, homeOrder: val }
                                : x
                            )
                          );
                        }}
                      />

                      <span className="text-sm text-zinc-100 truncate">
                        {c.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        className="rounded-md bg-amber-600 hover:bg-amber-700 px-2 py-1 text-xs text-white"
                        onClick={async () => {
                          try {
                            const updated = await patchCategory(c.id, {
                              homeOrder: c.homeOrder ?? 1000
                            });
                            setCats(prev =>
                              prev.map(x =>
                                x.id === c.id ? updated : x
                              )
                            );
                            toast.success("Guardado");
                          } catch {
                            toast.error("Error");
                          }
                        }}
                      >
                        Guardar
                      </button>
                      <button
                        className="rounded-md bg-red-600 hover:bg-red-700 px-2 py-1 text-xs text-white"
                        onClick={() => onDeleteCategory(c.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </li>
                ))}

                {cats.length === 0 && !catsLoading && (
                  <li className="px-3 py-3 text-sm text-zinc-400">
                    No hay categorías
                  </li>
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

      {/* MODAL PLUSES */}
      {showPluses && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-3">
          <div className="w-full max-w-lg rounded-2xl border border-stone-800 bg-[#1a1d1f] p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-zinc-100">
                Pluses
              </h2>
              <button
                className="text-sm rounded-lg bg-[#2a2a28] border border-stone-700 px-2 py-1 text-zinc-200 hover:bg-[#323230]"
                onClick={() => setShowPluses(false)}
              >
                ✕
              </button>
            </div>

            {/* Crear plus */}
            <div className="mb-3">
              <label className="text-xs text-zinc-400">Nuevo plus</label>
              <div className="flex gap-2">
                <input
                  className="flex-1 rounded-lg bg-[#0f1113] ring-1 ring-stone-800 px-2 py-1 text-sm text-zinc-100"
                  value={newPlus}
                  onChange={e => setNewPlus(e.target.value)}
                  placeholder="Batería extra"
                />
                <button
                  className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-sm text-white"
                  onClick={onCreatePlus}
                  disabled={plusesLoading}
                >
                  Crear
                </button>
              </div>
            </div>

            {/* Lista pluses */}
            <div className="rounded-xl border border-stone-800 overflow-hidden">
              <div className="bg-[#0f1113] px-3 py-2 text-xs text-zinc-400">
                {plusesLoading
                  ? "Cargando..."
                  : `Total: ${pluses.length}`}
              </div>

              <ul className="max-h-72 overflow-auto divide-y divide-stone-800">
                {pluses.map(pl => (
                  <li
                    key={pl.id}
                    className="flex items-center justify-between px-3 py-2"
                  >
                    <span className="text-sm text-zinc-100">
                      {pl.name}
                    </span>
                    <button
                      className="rounded-md bg-red-600 hover:bg-red-700 px-2 py-1 text-xs text-white"
                      onClick={() => onDeletePlus(pl.id)}
                    >
                      Eliminar
                    </button>
                  </li>
                ))}

                {pluses.length === 0 && !plusesLoading && (
                  <li className="px-3 py-3 text-sm text-zinc-400">
                    No hay pluses
                  </li>
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
