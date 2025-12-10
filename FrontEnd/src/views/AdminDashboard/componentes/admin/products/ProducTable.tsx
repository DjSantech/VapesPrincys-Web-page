import type { AdminProduct } from "../../../../../services/admin";

import { ProductRow } from "./ProductRow";

interface ProductTableProps {
  items: AdminProduct[];
  loading: boolean;
  onUploadImage: (id: string, file: File) => void;
  onDelete: (id: string) => void;
  // AÑADIDO: Propiedad para manejar el clic en la fila
  onRowClick: (product: AdminProduct) => void; 
}

export function ProductTable({ items, loading, onUploadImage, onDelete, onRowClick }: ProductTableProps) {
  return (
    <div className="rounded-xl border border-stone-800 overflow-hidden">

      <div className="bg-[#0f1113] px-3 py-2 text-xs text-zinc-400">
        {loading ? "Cargando..." : `Total: ${items.length}`}
      </div>

      <table className="w-full text-sm text-zinc-100">
        <thead className="bg-[#0f1113] text-zinc-400 text-xs uppercase">
          <tr>
            <th className="px-3 py-2 text-left">Imagen</th>
            <th className="px-3 py-2 text-left">SKU</th>
            <th className="px-3 py-2 text-left">Nombre</th>
            <th className="px-3 py-2 text-left">Precio</th>
            <th className="px-3 py-2 text-left">Stock</th>
            <th className="px-3 py-2 text-left">Visible</th>
            <th className="px-3 py-2 text-left">Acciones</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-stone-800">
          {items.map((p) => (
            <ProductRow
              key={p.id}
              p={p}
              onUploadImage={onUploadImage}
              onDelete={onDelete}
              onRowClick={onRowClick} // PASAR: la función al componente hijo
            />
          ))}
        </tbody>
      </table>

    </div>
  );
}