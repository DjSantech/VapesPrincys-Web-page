import { useEffect, useState } from "react";
// Importamos los servicios y tipos necesarios
import { getCategories, getPluses } from "../../../../../services/admin";
import type { 
  AdminCategory, 
  AdminPlus, 
  CreateProductPayload 
} from "../../../../../services/admin";

interface ProductCreateModalProps {
  onClose: () => void;
  onCreate: (data: CreateProductPayload) => void; 
}

// =========================================================
// Componente auxiliar para inputs
// =========================================================
interface InputGroupProps {
  label: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  type: string;
  placeholder?: string;
}

const InputGroup: React.FC<InputGroupProps> = ({ label, name, value, onChange, type, placeholder }) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-zinc-400">{label}</label>
    <input
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full bg-[#141619] px-3 py-2 rounded ring-1 ring-stone-800 text-sm text-zinc-100"
      onWheel={(e) => e.currentTarget.blur()} 
    />
  </div>
);

export function ProductCreateModal({ onClose, onCreate }: ProductCreateModalProps) {
  // --- 1. ESTADOS PARA DATOS DINÁMICOS ---
  const [availableCategories, setAvailableCategories] = useState<AdminCategory[]>([]);
  const [availablePluses, setAvailablePluses] = useState<AdminPlus[]>([]);
  const [loading, setLoading] = useState(true);

  // --- ESTADOS DEL FORMULARIO ---
  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [puffs, setPuffs] = useState(0);
  const [ml, setMl] = useState(0);
  const [category, setCategory] = useState("");
  const [hasFlavors, setHasFlavors] = useState(false);
  
  // ESTADOS DE SABORES (Separados para evitar pérdida de foco)
  const [flavors, setFlavors] = useState<string[]>([]);
  const [flavorsInput, setFlavorsInput] = useState(""); 

  const [visible, setVisible] = useState(true);
  const [visibleWhoSale, setVisibleWhoSale] = useState(false);
  const [pluses, setPluses] = useState<string[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [wholesaleRates, setWholesaleRates] = useState({
    tier1: 0,
    tier2: 0,
    tier3: 0
  });

  // --- 2. EFECTO DE CARGA INICIAL ---
  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true);
        const [cats, pls] = await Promise.all([
          getCategories(),
          getPluses()
        ]);
        setAvailableCategories(cats);
        setAvailablePluses(pls);
      } catch (error) {
        console.error("Error cargando datos del modal:", error);
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, []);

  const handlePlusChange = (plusName: string, isChecked: boolean) => {
    if (isChecked) {
      setPluses(prev => Array.from(new Set([...prev, plusName])));
    } else {
      setPluses(prev => prev.filter(p => p !== plusName));
    }
  };

  const submit = () => {
    if (!name.trim() || !sku.trim() || !category) {
      alert("Nombre, SKU y Categoría son obligatorios.");
      return;
    }
    
    const payload: CreateProductPayload = {
      sku: sku.trim(),
      name: name.trim(),
      price,
      image,
      description: description.trim(),
      stock,
      puffs,
      ml,
      category,
      hasFlavors,
      flavors, // Enviamos el array procesado
      pluses,
      visible, 
      visibleWhoSale,
      wholesaleRates,
    };

    onCreate(payload);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center backdrop-blur-sm z-50 p-4">
      <div className="bg-[#0f1113] p-6 rounded-xl border border-stone-800 space-y-4 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        
        <h3 className="text-xl font-semibold text-zinc-100">Nuevo Producto</h3>

        {loading ? (
          <div className="py-10 text-center text-emerald-500 animate-pulse">
            Cargando categorías y pluses...
          </div>
        ) : (
          <>
            <InputGroup 
              label="Nombre" 
              name="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              type="text" 
              placeholder="Nombre del vape"
            />

            <div>
              <label className="block text-sm font-medium text-zinc-400">Descripción</label>
              <textarea
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#141619] px-3 py-2 rounded ring-1 ring-stone-800 text-sm text-zinc-100 h-20"
                placeholder="Describe el producto aquí..."
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <InputGroup label="SKU" name="sku" value={sku} onChange={(e) => setSku(e.target.value)} type="text" />
              <InputGroup label="Precio" name="price" value={price} onChange={(e) => setPrice(+e.target.value)} type="number" />
              <InputGroup label="Stock" name="stock" value={stock} onChange={(e) => setStock(+e.target.value)} type="number" />
              <InputGroup label="Puffs" name="puffs" value={puffs} onChange={(e) => setPuffs(+e.target.value)} type="number" />
              <InputGroup label="ml" name="ml" value={ml} onChange={(e) => setMl(+e.target.value)} type="number" />

              <div className="space-y-1">
                <label className="block text-sm font-medium text-zinc-400">Categoría</label>
                <select
                  name="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#141619] px-3 py-2 rounded ring-1 ring-stone-800 text-sm text-zinc-100 h-10 appearance-none"
                >
                  <option value="" disabled>— Selecciona —</option> 
                  {availableCategories.map(cat => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center space-x-2 pt-6">
                <input 
                  id="hasFlavors" 
                  type="checkbox" 
                  checked={hasFlavors} 
                  onChange={(e) => {
                    setHasFlavors(e.target.checked);
                    if (!e.target.checked) {
                      setFlavors([]);
                      setFlavorsInput("");
                    }
                  }} 
                  className="h-4 w-4 text-emerald-600 rounded bg-stone-700" 
                />
                <label htmlFor="hasFlavors" className="text-sm text-zinc-200">Con sabores</label>
              </div>
              
              <div className="flex items-center space-x-2 pt-6">
                <input id="visible" type="checkbox" checked={visible} onChange={(e) => setVisible(e.target.checked)} className="h-4 w-4 text-emerald-600 rounded bg-stone-700" />
                <label htmlFor="visible" className="text-sm text-zinc-200">Visible</label>
              </div>
            
              
              <div className="flex items-center space-x-2 pt-6">
                <input id="visibleWhoSale" type="checkbox" checked={visibleWhoSale} onChange={(e) => setVisibleWhoSale(e.target.checked)} className="h-4 w-4 text-emerald-600 rounded bg-stone-700" />
                <label htmlFor="visibleWhoSale" className="text-sm text-zinc-200">Visible</label>
              </div>
            </div>
            

            <div className="col-span-full mt-4 p-4 bg-zinc-900/50 rounded-xl border border-emerald-500/20">
              <h4 className="text-emerald-400 text-sm font-bold mb-3 uppercase tracking-wider">Precios de Mayoreo (Tiers)</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InputGroup 
                  label="Tier 1 (10-30 u.)" 
                  name="tier1" 
                  value={wholesaleRates.tier1} 
                  onChange={(e) => setWholesaleRates({...wholesaleRates, tier1: +e.target.value})} 
                  type="number" 
                />
                <InputGroup 
                  label="Tier 2 (31-50 u.)" 
                  name="tier2" 
                  value={wholesaleRates.tier2} 
                  onChange={(e) => setWholesaleRates({...wholesaleRates, tier2: +e.target.value})} 
                  type="number" 
                />
                <InputGroup 
                  label="Tier 3 (51+ u.)" 
                  name="tier3" 
                  value={wholesaleRates.tier3} 
                  onChange={(e) => setWholesaleRates({...wholesaleRates, tier3: +e.target.value})} 
                  type="number" 
                />
              </div>
            </div>

            {/* CAMPO DE SABORES CORREGIDO */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-zinc-400 mb-1">Sabores (separados por coma)</label>
              <input
                value={flavorsInput} 
                onChange={(e) => {
                  setFlavorsInput(e.target.value);
                  const arrayFlavors = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                  setFlavors(arrayFlavors);
                }}
                disabled={!hasFlavors}
                className={`w-full px-3 py-2 rounded ring-1 text-sm text-zinc-100 ${hasFlavors ? 'bg-[#141619] ring-stone-800' : 'bg-[#1e1e1e] ring-stone-900 opacity-50'}`}
                placeholder="Menta, Berries, Mango"
              />
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-zinc-400 mb-2">Pluses Disponibles</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {availablePluses.map(plus => (
                  <div key={plus.id} className="flex items-center space-x-2 bg-[#141619] p-2 rounded border border-stone-800">
                    <input
                      id={`plus-${plus.id}`}
                      type="checkbox"
                      checked={pluses.includes(plus.name)}
                      onChange={(e) => handlePlusChange(plus.name, e.target.checked)}
                      className="h-4 w-4 text-emerald-600 rounded bg-stone-700 cursor-pointer"
                    />
                    <label htmlFor={`plus-${plus.id}`} className="text-[10px] text-zinc-300 uppercase cursor-pointer truncate">
                      {plus.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between border-t border-stone-800 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-400">Imagen del Producto</label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setImage(file);
                    setPreview(URL.createObjectURL(file));
                  }
                }}
                className="text-xs text-zinc-400 file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-zinc-700 file:text-white hover:file:bg-zinc-600"
              />
              {preview && <img src={preview} alt="Preview" className="h-12 w-12 rounded-md object-cover border border-stone-700" />}
            </div>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <button onClick={onClose} className="flex-1 px-4 py-2 bg-zinc-700 rounded text-white hover:bg-zinc-600 text-sm">
              Cancelar
            </button>
            <button onClick={submit} className="flex-1 px-4 py-2 bg-emerald-600 rounded text-white hover:bg-emerald-700 text-sm font-bold">
              Crear Producto
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}