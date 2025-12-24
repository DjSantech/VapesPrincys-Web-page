import { useState, useEffect } from 'react';
import type { AdminProduct } from '../../services/admin'; 
import { calculateWholesalePrice, MIN_WHOLESALE_QTY } from '../../utils/wholesaleUtils';
import { optimizeImage } from '../../utils/cloudinary';
import { Info } from 'lucide-react';

interface Props {
  products: AdminProduct[];
  onAdd: (product: AdminProduct, flavor: string, quantity: number) => void;
}

export function WholesaleTable({ products, onAdd }: Props) {
  return (
    <div className="space-y-6">
      <div className="bg-emerald-950/30 border border-emerald-500/30 p-4 rounded-2xl flex items-center gap-4 shadow-lg">
        <div className="bg-emerald-500/20 p-2 rounded-full text-emerald-400">
          <Info size={24} />
        </div>
        <p className="text-emerald-300 font-medium italic">
          "¡Entre más unidades lleves, el precio disminuirá mucho más, anímate!"
        </p>
      </div>

      {/* Vista Desktop */}
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

      {/* Vista Mobile */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {products.map((product) => (
          <ProductCardMobile key={product.id} product={product} onAdd={onAdd} />
        ))}
      </div>
    </div>
  );
}

function ProductRowDesktop({ product, onAdd }: { product: AdminProduct; onAdd: Props['onAdd'] }) {
  const [selectedFlavor, setSelectedFlavor] = useState<string>(product.flavors[0] || '');
  const [inputValue, setInputValue] = useState<string>(MIN_WHOLESALE_QTY.toString());
  const [isAnimating, setIsAnimating] = useState(false);

  const numericQty = Number(inputValue) || 0;
  const effectiveQty = Math.max(MIN_WHOLESALE_QTY, numericQty);
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
          <div className="w-20 h-20 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 p-1 group-hover:border-emerald-500/50">
            <img src={optimizeImage(product.imageUrl, 400)} className="w-full h-full object-contain" />
          </div>
          <span className="font-bold text-white text-lg">{product.name}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <select 
          className="bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-sm text-white"
          value={selectedFlavor}
          onChange={(e) => setSelectedFlavor(e.target.value)}
        >
          {product.flavors.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      </td>
      <td className="px-6 py-4 text-zinc-400 font-mono">${product.price.toLocaleString()}</td>
      <td className="px-6 py-4 text-center">
        <input 
          type="number" 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-20 bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-center text-white outline-none focus:border-emerald-500"
        />
      </td>
      <td className="px-6 py-4">
        <div className={`transition-all duration-300 font-black text-xl ${isAnimating ? 'scale-110 text-white' : 'text-emerald-400'}`}>
          ${currentPrice.toLocaleString()}
        </div>
      </td>
      <td className="px-6 py-4 text-right">
        <button 
          onClick={() => onAdd(product, selectedFlavor, effectiveQty)}
          disabled={numericQty < MIN_WHOLESALE_QTY}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 text-white px-6 py-2 rounded-xl font-bold transition-all"
        >
          Añadir
        </button>
      </td>
    </tr>
  );
}

function ProductCardMobile({ product, onAdd }: { product: AdminProduct; onAdd: Props['onAdd'] }) {
  const [selectedFlavor, setSelectedFlavor] = useState<string>(product.flavors[0] || '');
  const [inputValue, setInputValue] = useState<string>(MIN_WHOLESALE_QTY.toString());
  const effectiveQty = Math.max(MIN_WHOLESALE_QTY, Number(inputValue) || 0);
  const currentPrice = calculateWholesalePrice(product, effectiveQty);

  return (
    <div className="bg-[#0f1113] border border-zinc-800 rounded-2xl p-4 space-y-4">
      <div className="flex gap-4">
        <img src={optimizeImage(product.imageUrl, 400)} className="w-24 h-24 bg-zinc-900 rounded-xl object-contain" />
        <div>
          <h3 className="text-white font-bold text-lg">{product.name}</h3>
          <p className="text-zinc-500 text-xs">Base: ${product.price.toLocaleString()}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <select className="bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-sm text-white" value={selectedFlavor} onChange={(e) => setSelectedFlavor(e.target.value)}>
          {product.flavors.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
        <input type="number" value={inputValue} onChange={(e) => setInputValue(e.target.value)} className="bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-center text-white" />
      </div>
      <div className="flex justify-between items-center pt-2 border-t border-zinc-800">
        <span className="text-emerald-400 font-black text-xl">${currentPrice.toLocaleString()}</span>
        <button onClick={() => onAdd(product, selectedFlavor, effectiveQty)} className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold">AÑADIR</button>
      </div>
    </div>
  );
}