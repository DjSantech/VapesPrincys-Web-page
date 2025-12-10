// src/views/AdminDashboard/sections/CategoriesSection.tsx

import { useState } from "react";
import type { AdminCategory } from "../../../services/admin";
import {
  patchCategory,
  patchCategoryImage,
  deleteCategoryById,
  createCategory,
} from "../../../services/admin";

interface CategoriesSectionProps {
  items: AdminCategory[];
  setItems: React.Dispatch<React.SetStateAction<AdminCategory[]>>;
  loading: boolean;
}

export function CategoriesSection({ items, setItems, loading }: CategoriesSectionProps) {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  

  // Crear categoría
  const onCreate = async () => {
    if (!name.trim()) {
      alert("El nombre es obligatorio");
      return;
    }
    try {
      const created = await createCategory(name.trim());
      setItems(prev => [...prev, created]);
      setName("");
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert("Error creando categoría");
    }
  };

  // Editar nombre / homeOrder
  const onSaveRow = async (id: string, patch: Partial<AdminCategory>) => {
    try {
      const updated = await patchCategory(id, patch);
      setItems(prev => prev.map(c => (c.id === id ? updated : c)));
    } catch (err) {
      console.error(err);
      alert("Error actualizando");
    }
  };

  // Subir imagen
  const onUploadImage = async (id: string, file: File) => {
    try {
      const updated = await patchCategoryImage(id, file);
      setItems(prev => prev.map(c => (c.id === id ? updated : c)));
    } catch (err) {
      console.error(err);
      alert("Error subiendo imagen");
    }
  };

  // Eliminar categoría
  const onDeleteRow = async (id: string) => {
    if (!confirm("¿Eliminar esta categoría?")) return;
    try {
      await deleteCategoryById(id);
      setItems(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error(err);
      alert("Error eliminando");
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl text-zinc-100 font-semibold">Categorías</h2>

        <button
          onClick={() => setShowModal(true)}
          className="bg-sky-600 hover:bg-sky-700 px-3 py-1 rounded text-white text-sm"
        >
          Añadir Categoría
        </button>
      </div>

      {/* Tabla */}
      <div className="rounded-xl border border-stone-800 overflow-hidden">
        <div className="bg-[#0f1113] px-3 py-2 text-xs text-zinc-400">
          {loading ? "Cargando..." : `Total: ${items.length}`}
        </div>

        <table className="w-full text-sm text-zinc-100">
          <thead className="bg-[#0f1113] text-zinc-400 text-xs uppercase">
            <tr>
              <th className="px-3 py-2 text-left">Imagen</th>
              <th className="px-3 py-2 text-left">Nombre</th>
              <th className="px-3 py-2 text-left">Orden</th>
              <th className="px-3 py-2 text-left">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-stone-800">
            {items.map((c) => (
              <tr key={c.id}>
                {/* Imagen */}
                <td className="px-3 py-2">
                  <label className="cursor-pointer">
                    <img
                      src={c.imageUrl || `https://picsum.photos/seed/${c.id}/40`}
                      className="h-10 w-10 rounded-md object-cover"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) onUploadImage(c.id, f);
                      }}
                    />
                  </label>
                </td>

                {/* Nombre editable */}
                <td className="px-3 py-2">
                  <input
                    className="bg-transparent border border-stone-700 rounded px-2 py-1 text-sm"
                    value={c.name}
                    onChange={(e) =>
                      onSaveRow(c.id, { name: e.target.value })
                    }
                  />
                </td>

                {/* Orden editable */}
                <td className="px-3 py-2">
                  <input
                    type="number"
                    className="bg-transparent border border-stone-700 rounded px-2 py-1 w-20 text-sm"
                    value={c.homeOrder ?? ""}
                    onChange={(e) =>
                      onSaveRow(c.id, { homeOrder: Number(e.target.value) })
                    }
                  />
                </td>

                {/* Acciones */}
                <td className="px-3 py-2">
                  <button
                    onClick={() => onDeleteRow(c.id)}
                    className="bg-red-600 px-2 py-1 rounded text-white text-xs"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL CREAR CATEGORÍA */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-[#0f1113] p-6 rounded-xl border border-stone-700 w-[350px] space-y-3">
            <h3 className="text-lg text-white font-semibold">Nueva Categoría</h3>

            <input
              placeholder="Nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#141619] px-3 py-2 rounded text-sm ring-1 ring-stone-700"
            />

            <div className="flex justify-end gap-2 pt-3">
              <button
                className="px-3 py-1 bg-zinc-700 text-white rounded"
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </button>

              <button
                className="px-3 py-1 bg-sky-600 text-white rounded"
                onClick={onCreate}
              >
                Crear
              </button>
            </div>

          </div>
        </div>
      )}

    </section>
  );
}
