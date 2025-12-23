import { useState, useEffect } from 'react';
// 🚩 CORRECCIÓN 1: Importación como tipo para evitar el error de verbatimModuleSyntax
import type { AdminProduct } from '../../services/admin.types'; 
import { calculateWholesalePrice, MIN_WHOLESALE_QTY } from '../../utils/wholesaleUtils';
import { optimizeImage } from '../../utils/cloudinary';
import { Info } from 'lucide-react';

export interface WholesaleCartItem {
  productId: string;
  name: string;
  flavor: string;
  quantity: number;
  unitPrice: number;
}

interface Props {
  products: AdminProduct[];
  onAdd: (item: WholesaleCartItem) => void;
}

export function WholesaleTable({ products, onAdd }: Props) {
  return (
    <div className="space-y-6">
      {/* Banner Informativo */}
      <div className="bg-emerald-950/30 border border-emerald-500/30 p-4 rounded-2xl flex items-center gap-4 shadow-lg shadow-emerald-950/20">
        <div className="bg-emerald-500/20 p-2 rounded-full text-emerald-400">
          <Info size={24} />
        </div>
        <p className="text-emerald-300 font-medium text-sm md:text-lg italic leading-tight">
          "¡Entre más unidades lleves, el precio disminuirá mucho más, anímate!"
        </p>
      </div>

      <div className="hidden md:block overflow-hidden rounded-2xl border border-zinc-800 bg-[#0f1113]">
        <table className="w-full text-left text-zinc-300">
          <thead className="bg-zinc-900/80 text-xs uppercase text-zinc-500 font-bold">
            <tr>
              <th className="px-6 py-5">Producto</th>
              <th className="px-6 py-5">Sabor</th>
              <th className="px-6 py-5">Precio Unit.</th>
              <th className="px-6 py-5 text-center">Cantidad</th>
              <th className="px-6 py-5">Precio Mayoreo</th>
              <th className="px-6 py-5 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {products.map((product) => (
              <ProductRowDesktop key={product.id} product={product} onAdd={onAdd} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 gap-4 md:hidden">
        {products.map((product) => (
          <ProductCardMobile key={product.id} product={product} onAdd={onAdd} />
        ))}
      </div>
    </div>
  );
}

function ProductRowDesktop({ product, onAdd }: { product: AdminProduct; onAdd: (item: WholesaleCartItem) => void }) {
  const [selectedFlavor, setSelectedFlavor] = useState<string>(product.flavors[0] || '');
  const [inputValue, setInputValue] = useState<string>(MIN_WHOLESALE_QTY.toString());
  const [isAnimating, setIsAnimating] = useState(false);

  const numericQty = Number(inputValue) || 0;
  const effectiveQty = Math.max(MIN_WHOLESALE_QTY, numericQty);
  
  // 🚩 CORRECCIÓN 2: Pasamos el objeto 'product' completo, no solo 'product.price'
  const currentPrice = calculateWholesalePrice(product, effectiveQty);

  useEffect(() => {
    if (numericQty >= MIN_WHOLESALE_QTY) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 400);
      return () => clearTimeout(timer);
    }
  }, [numericQty]);

  return (
    <tr className="hover:bg-zinc-800/20 transition-colors group">
      <td className="px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 p-1 shrink-0 group-hover:border-emerald-500/50 transition-colors">
            <img src={optimizeImage(product.imageUrl, 400)} alt={product.name} className="w-full h-full object-contain" />
          </div>
          <span className="font-bold text-white text-lg">{product.name}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        {product.hasFlavors ? (
          <select 
            className="bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none w-full max-w-[160px]"
            value={selectedFlavor}
            onChange={(e) => setSelectedFlavor(e.target.value)}
          >
            {product.flavors.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        ) : <span className="text-zinc-500">N/A</span>}
      </td>
      <td className="px-6 py-4 text-zinc-400 font-mono">${product.price.toLocaleString('es-CO')}</td>
      <td className="px-6 py-4">
        <div className="flex flex-col items-center gap-1">
          <input 
            type="number" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={() => numericQty < MIN_WHOLESALE_QTY && setInputValue(MIN_WHOLESALE_QTY.toString())}
            className={`w-24 bg-zinc-900 border ${numericQty < MIN_WHOLESALE_QTY ? 'border-red-500' : 'border-zinc-700'} rounded-lg p-2 text-center text-white focus:border-emerald-500 outline-none`}
          />
          {numericQty < MIN_WHOLESALE_QTY && <span className="text-[10px] text-red-500 font-bold italic">Mín. {MIN_WHOLESALE_QTY}</span>}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className={`transition-all duration-300 font-black text-xl ${isAnimating ? 'scale-110 text-white' : 'text-emerald-400'}`}>
          ${currentPrice.toLocaleString('es-CO')}
        </div>
      </td>
      <td className="px-6 py-4 text-right">
        <button 
          onClick={() => onAdd({ productId: product.id, name: product.name, flavor: selectedFlavor, quantity: effectiveQty, unitPrice: product.price })}
          disabled={numericQty < MIN_WHOLESALE_QTY}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white px-6 py-2 rounded-xl font-bold transition-all shadow-lg hover:shadow-emerald-600/20 active:scale-95"
        >
          Añadir
        </button>
      </td>
    </tr>
  );
}

function ProductCardMobile({ product, onAdd }: { product: AdminProduct; onAdd: (item: WholesaleCartItem) => void }) {
  const [selectedFlavor, setSelectedFlavor] = useState<string>(product.flavors[0] || '');
  const [inputValue, setInputValue] = useState<string>(MIN_WHOLESALE_QTY.toString());

  const numericQty = Number(inputValue) || 0;
  const effectiveQty = Math.max(MIN_WHOLESALE_QTY, numericQty);
  
  // 🚩 CORRECCIÓN 3: Pasamos 'product' completo aquí también
  const currentPrice = calculateWholesalePrice(product, effectiveQty);

  return (
    <div className="bg-[#0f1113] border border-zinc-800 rounded-2xl p-4 space-y-4">
      <div className="flex gap-4">
        <div className="w-28 h-28 bg-zinc-900 rounded-xl border border-zinc-800 p-2 shrink-0">
          <img src={optimizeImage(product.imageUrl, 400)} alt={product.name} className="w-full h-full object-contain" />
        </div>
        <div className="flex flex-col justify-center">
          <h3 className="text-white font-black text-xl leading-tight">{product.name}</h3>
          <p className="text-zinc-500 text-sm">Precio base: ${product.price.toLocaleString('es-CO')}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-zinc-500 uppercase font-bold">Sabor</label>
          {product.hasFlavors ? (
            <select 
              className="bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-sm text-white outline-none"
              value={selectedFlavor}
              onChange={(e) => setSelectedFlavor(e.target.value)}
            >
              {product.flavors.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          ) : <div className="bg-zinc-900 p-2 rounded-lg text-zinc-600 text-sm">N/A</div>}
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-zinc-500 uppercase font-bold">Cantidad</label>
          <input 
            type="number" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={() => numericQty < MIN_WHOLESALE_QTY && setInputValue(MIN_WHOLESALE_QTY.toString())}
            className="bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-center text-white outline-none"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
        <div className="flex flex-col">
          <span className="text-[10px] text-zinc-500 uppercase font-bold">Total x Unidad</span>
          <span className="text-emerald-400 font-black text-2xl">${currentPrice.toLocaleString('es-CO')}</span>
        </div>
        <button 
          onClick={() => onAdd({ productId: product.id, name: product.name, flavor: selectedFlavor, quantity: effectiveQty, unitPrice: product.price })}
          disabled={numericQty < MIN_WHOLESALE_QTY}
          className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-black text-sm active:scale-95 disabled:bg-zinc-800"
        >
          AÑADIR
        </button>
      </div>
      {numericQty < MIN_WHOLESALE_QTY && <p className="text-center text-red-500 text-[10px] font-bold">⚠️ Compra mínima: {MIN_WHOLESALE_QTY} unidades</p>}
    </div>
  );
}