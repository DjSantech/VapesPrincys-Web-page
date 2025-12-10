// src/views/AdminDashboard/sections/PlusesSection.tsx

import { useState } from "react";
import type { AdminPlus } from "../../../services/admin";
import { createPlus, deletePlusById } from "../../../services/admin";

interface PlusesSectionProps {
  items: AdminPlus[];
  setItems: React.Dispatch<React.SetStateAction<AdminPlus[]>>;
  loading?: boolean;
}

export function PlusesSection({ items, setItems }: PlusesSectionProps) {
  const [newPlus, setNewPlus] = useState("");

  const onCreate = async () => {
    const name = newPlus.trim();
    if (!name) return;

    try {
      const created = await createPlus(name);
      setItems(prev => [created, ...prev]);
      setNewPlus("");
    } catch (e) {
      console.error(e);
      alert("Error creando plus");
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("¿Eliminar este plus?")) return;
    try {
      await deletePlusById(id);
      setItems(prev => prev.filter(p => p.id !== id));
    } catch (e) {
      console.error(e);
      alert("Error eliminando plus");
    }
  };

  return (
    <section className="mt-8 space-y-4">
      <h2 className="text-xl font-semibold text-zinc-100">Pluses</h2>

      <div className="flex gap-3">
        <input
          value={newPlus}
          onChange={(e) => setNewPlus(e.target.value)}
          placeholder="Nuevo plus"
          className="px-3 py-2 bg-[#1a1d1f] text-white rounded-lg flex-1"
        />

        <button
          onClick={onCreate}
          className="bg-emerald-600 hover:bg-emerald-700 px-3 py-2 rounded-lg text-white"
        >
          Crear
        </button>
      </div>

      <ul className="rounded-xl border border-stone-800 divide-y divide-stone-800">
        {items.map(p => (
          <li key={p.id} className="flex items-center justify-between px-3 py-2">
            <span className="text-sm text-zinc-200">{p.name}</span>

            <button
              className="bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded"
              onClick={() => onDelete(p.id)}
            >
              Eliminar
            </button>
          </li>
        ))}
      </ul>

      {items.length === 0 && (
        <p className="text-sm text-zinc-500">No hay pluses creados</p>
      )}
    </section>
  );
}
