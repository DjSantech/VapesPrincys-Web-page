import { useEffect, useState } from "react";
import { getProducts, getCategories, type AdminProduct, type AdminCategory } from "../../services/admin";

import { formatCOP } from "../../lib/format";
import ProductEditModal from "../AdminDashboard/componentes/admin/products/ProductEditModal";

export default function InventoryExcelView() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pData, cData] = await Promise.all([getProducts(), getCategories()]);
      setProducts(pData);
      setCategories(cData);
    } catch (error) {
      console.error("Error cargando inventario", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProduct = async (updated: AdminProduct) => {
    // Aquí podrías cerrar el modal y recargar los datos
    setProducts(products.map(p => p.id === updated.id ? updated : p));
    setEditingProduct(null);
  };

  if (loading) return <div className="p-10 text-white">Cargando Inventario Maestro...</div>;

  return (
    <div className="p-4 bg-[#0d0f10] min-h-screen text-zinc-200">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Inventario Maestro (Excel View)</h1>
          <p className="text-sm text-zinc-400">Total: {products.length} productos en catálogo</p>
        </div>
        <button 
          onClick={fetchData}
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs transition"
        >
          🔄 Actualizar Datos
        </button>
      </div>

      <div className="overflow-x-auto border border-stone-800 rounded-xl bg-[#111315]">
        <table className="w-full text-[11px] border-collapse">
          <thead>
            <tr className="bg-[#1a1d1f] text-zinc-400 border-b border-stone-800">
              <th className="p-3 text-left border-r border-stone-800">Producto</th>
              <th className="p-3 text-center border-r border-stone-800">Stock</th>
              <th className="p-3 text-center border-r border-stone-800 text-emerald-400">Vendidos</th>
              <th className="p-3 text-left border-r border-stone-800">Sabor más vendido</th>
              <th className="p-3 text-left border-r border-stone-800">Precio Público</th>
              <th className="p-3 text-left border-r border-stone-800 text-amber-500">Dropshipper</th>
              <th className="p-3 text-left border-r border-stone-800 text-blue-400">Mayoreo</th>
              <th className="p-3 text-left border-r border-stone-800 text-zinc-500">Costo (Base)</th>
              <th className="p-3 text-center">Editar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-800">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="p-2 font-medium text-zinc-100 border-r border-stone-800">{p.name}</td>
                <td className={`p-2 text-center border-r border-stone-800 ${p.stock < 5 ? 'text-red-500 font-bold' : ''}`}>
                  {p.stock}
                </td>
                <td className="p-2 text-center border-r border-stone-800 font-bold text-emerald-500">
                  {p.soldCount || 0}
                </td>
                <td className="p-2 border-r border-stone-800 text-zinc-400 italic">
                  {/* Aquí asumo que tienes el campo en tu base de datos */}
                  {p.topFlavor || "N/A"}
                </td>
                <td className="p-2 border-r border-stone-800">{formatCOP(p.price)}</td>
                <td className="p-2 border-r border-stone-800 text-amber-500/80">{formatCOP(p.dropshipperPrice || 0)}</td>
                <td className="p-2 border-r border-stone-800 text-blue-400/80">{formatCOP(p.wholesalePrice || 0)}</td>
                <td className="p-2 border-r border-stone-800 text-zinc-500">{formatCOP(p.costPrice || 0)}</td>
                <td className="p-2 text-center">
                  <button 
                    onClick={() => setEditingProduct(p)}
                    className="p-1.5 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white transition"
                  >
                    ✏️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* REUTILIZACIÓN DE TU MODAL ORIGINAL */}
      {editingProduct && (
        <ProductEditModal
          product={editingProduct}
          categories={categories}
          onClose={() => setEditingProduct(null)}
          onSave={handleUpdateProduct}
        />
      )}
    </div>
  );
}