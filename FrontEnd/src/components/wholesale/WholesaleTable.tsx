import React, { useState } from 'react';
import type { AdminProduct } from '../../services/admin';
import { calculateWholesalePrice, MIN_WHOLESALE_QTY } from '../../utils/wholesaleUtils';

// 1. Definimos la interfaz exacta de lo que el carrito espera recibir
export interface WholesaleCartItem {
  productId: string;
  name: string;
  flavor: string;
  quantity: number;
  unitPrice: number;
}

interface Props {
  products: AdminProduct[];
  // 2. Reemplazamos 'any' por la interfaz creada
  onAdd: (item: WholesaleCartItem) => void;
}

export function WholesaleTable({ products, onAdd }: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-[#0f1113]">
      <table className="w-full text-left text-zinc-300">
        <thead className="bg-zinc-900/50 text-xs uppercase text-zinc-500">
          <tr>
            <th className="px-6 py-4">Producto</th>
            <th className="px-6 py-4">Sabor</th>
            <th className="px-6 py-4">Precio Base</th>
            <th className="px-6 py-4">Cantidad (min. {MIN_WHOLESALE_QTY})</th>
            <th className="px-6 py-4">Precio Mayoreo</th>
            <th className="px-6 py-4">Acción</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {products.map((product) => (
            <ProductRow key={product.id} product={product} onAdd={onAdd} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

// 3. Tipamos las props del componente interno
interface ProductRowProps {
  product: AdminProduct;
  onAdd: (item: WholesaleCartItem) => void;
}

function ProductRow({ product, onAdd }: ProductRowProps) {
  const [selectedFlavor, setSelectedFlavor] = useState<string>(product.flavors[0] || '');
  const [qty, setQty] = useState<number>(MIN_WHOLESALE_QTY);

  const currentPrice = calculateWholesalePrice(product.price, qty);

  const handleAddClick = () => {
  onAdd({
    productId: product.id,
    name: product.name,
    flavor: selectedFlavor,
    quantity: qty,
    unitPrice: product.price // Pasamos el precio normal, el hook hará el descuento
  });
};

  return (
    <tr className="hover:bg-zinc-800/30 transition">
      <td className="px-6 py-4 font-medium text-white">{product.name}</td>
      <td className="px-6 py-4">
        {product.hasFlavors ? (
          <select 
            className="bg-zinc-900 border border-zinc-700 rounded text-sm p-1 focus:ring-1 focus:ring-emerald-500 outline-none"
            value={selectedFlavor}
            onChange={(e) => setSelectedFlavor(e.target.value)}
          >
            {product.flavors.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        ) : (
          <span className="text-zinc-500 text-sm">N/A</span>
        )}
      </td>
      <td className="px-6 py-4 text-zinc-500">
        ${product.price.toLocaleString('es-CO')}
      </td>
      <td className="px-6 py-4">
        <input 
          type="number" 
          min={MIN_WHOLESALE_QTY}
          value={qty}
          onChange={(e) => setQty(Math.max(MIN_WHOLESALE_QTY, Number(e.target.value)))}
          className="w-20 bg-zinc-900 border border-zinc-700 rounded p-1 text-center text-white focus:border-emerald-500 outline-none"
        />
      </td>
      <td className="px-6 py-4 text-emerald-400 font-bold">
        ${currentPrice.toLocaleString('es-CO')}
      </td>
      <td className="px-6 py-4">
        <button 
          onClick={handleAddClick}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition shadow-lg shadow-emerald-900/20"
        >
          Añadir
        </button>
      </td>
    </tr>
  );
}