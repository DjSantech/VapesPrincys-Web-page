import type { AdminProduct } from "../../../../../services/admin";
import { optimizeImage } from "../../../../../utils/cloudinary";

interface ProductRowProps {
  p: AdminProduct;
  onUploadImage: (id: string, file: File) => void;
  onDelete: (id: string) => void;
  // AÑADIDO: Función para manejar el clic en la fila
  onRowClick: (product: AdminProduct) => void; 
}

export function ProductRow({ p, onUploadImage, onDelete, onRowClick }: ProductRowProps) {
  return (
    // CAMBIO: Se añade onClick y estilos de hover/cursor a la fila
    <tr 
      key={p.id}
      onClick={() => onRowClick(p)} 
      className="cursor-pointer hover:bg-[#1a1d1f] transition" 
    >

      {/* Imagen */}
      <td className="px-3 py-2">
        <label className="cursor-pointer">
          <img
            src={optimizeImage(p.imageUrl || "", 150)}
            className="h-12 w-12 object-cover rounded-md ring-1 ring-stone-700"
          />
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onUploadImage(p.id, f);
            }}
            onClick={(e) => e.stopPropagation()} // IMP: Evita que el clic en el input active onRowClick
          />
        </label>
      </td>

      {/* SKU */}
      <td className="px-3 py-2">{p.sku}</td>

      {/* Nombre */}
      <td className="px-3 py-2">{p.name}</td>

      {/* Precio */}
      <td className="px-3 py-2">${p.price}</td>

      {/* Stock */}
      <td className="px-3 py-2">{p.stock}</td>

      {/* Visible */}
      <td className="px-3 py-2">{p.visible ? "✔" : "✖"}</td>

      {/* Acciones */}
      <td className="px-3 py-2">
        <button
          // IMP: Parar la propagación para que al eliminar no se abra el modal de edición
          onClick={(e) => {
            e.stopPropagation(); 
            onDelete(p.id);
          }}
          className="bg-red-600 px-2 py-1 rounded text-white text-xs hover:bg-red-700"
        >
          Eliminar
        </button>
      </td>
    </tr>
  );
}