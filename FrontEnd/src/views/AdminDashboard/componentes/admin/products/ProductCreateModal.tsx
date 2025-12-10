import { useState } from "react";
// Asegúrate de que este tipo ProductCreateForm incluya todos los campos.
// Si no los incluye, debes actualizarlo en '../../../../../types/products'.
import type { ProductCreateForm } from "../../../../../types/products"; 

interface ProductCreateModalProps {
  onClose: () => void;
  // La función onCreate ahora recibirá todos los campos
  onCreate: (data: ProductCreateForm) => void; 
}

// =========================================================
// Componente auxiliar para inputs (reutilizado)
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
// =========================================================


export function ProductCreateModal({ onClose, onCreate }: ProductCreateModalProps) {
  // ESTADO INICIAL COMPLETO (Añadimos todos los campos)
  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [puffs, setPuffs] = useState(0);
  const [ml, setMl] = useState(0);
  const [category, setCategory] = useState("");
  const [hasFlavors, setHasFlavors] = useState(false);
  const [flavors, setFlavors] = useState<string[]>([]);
  const [visible, setVisible] = useState(true);
  const [pluses, setPluses] = useState<string[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const availablePluses = ['SALUD', 'SALIDA', 'KIT THC', 'THC RECARGA', 'THC PLUS', 'SMOKE', 'DINAMICO', 'JUGOOSO', 'QUALITY', 'COMESTIBLE', 'UNLIMITED', 'VIP']; // Ajusta según tus datos

  const handlePlusChange = (plusName: string, isChecked: boolean) => {
    if (isChecked) {
        setPluses(prev => Array.from(new Set([...prev, plusName])));
    } else {
        setPluses(prev => prev.filter(p => p !== plusName));
    }
  };

  const submit = () => {
    if (!name.trim() || !sku.trim()) {
        alert("El Nombre y SKU son obligatorios.");
        return;
    }
    
    // PAYLOAD COMPLETO
    const payload: ProductCreateForm = {
      sku: sku.trim(),
      name: name.trim(),
      price: price,
      image: image,
      // Nuevos campos
      description: description.trim(),
      stock: stock,
      puffs: puffs,
      ml: ml,
      category: category,
      hasFlavors: hasFlavors,
      flavors: flavors,
      pluses: pluses,
      visible: visible, 
    };

    onCreate(payload);
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center backdrop-blur-sm z-50">
      {/* Aumentamos el ancho para acomodar todos los campos */}
      <div className="bg-[#0f1113] p-6 rounded-xl border border-stone-800 space-y-4 w-full max-w-4xl max-h-[90vh] overflow-y-auto">

        <h3 className="text-xl font-semibold text-zinc-100">Nuevo Producto</h3>

        {/* NOMBRE */}
        <InputGroup 
            label="Nombre" 
            name="name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            type="text" 
            placeholder="Nombre del vape"
        />

        {/* DESCRIPCIÓN */}
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

        {/* GRID DE CAMPOS NUMÉRICOS Y SKU */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            <InputGroup 
                label="SKU" 
                name="sku" 
                value={sku} 
                onChange={(e) => setSku(e.target.value)} 
                type="text" 
                placeholder="SKU"
            />
            <InputGroup 
                label="Precio (COP)" 
                name="price" 
                value={price} 
                onChange={(e) => setPrice(+e.target.value)} 
                type="number" 
                placeholder="0"
            />
            <InputGroup 
                label="Stock" 
                name="stock" 
                value={stock} 
                onChange={(e) => setStock(+e.target.value)} 
                type="number" 
                placeholder="0"
            />
            <InputGroup 
                label="Puffs" 
                name="puffs" 
                value={puffs} 
                onChange={(e) => setPuffs(+e.target.value)} 
                type="number" 
                placeholder="0"
            />
            <InputGroup 
                label="ml" 
                name="ml" 
                value={ml} 
                onChange={(e) => setMl(+e.target.value)} 
                type="number" 
                placeholder="0"
            />

            {/* CATEGORÍA (SELECT BÁSICO) */}
            <div className="space-y-1">
                <label className="block text-sm font-medium text-zinc-400">Categoría</label>
                <select
                    name="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#141619] px-3 py-2 rounded ring-1 ring-stone-800 text-sm text-zinc-100 h-10 appearance-none"
                >
                    <option value="" disabled>— Selecciona —</option> 
                    {/* Sustituye estas opciones por las categorías reales si las tienes */}
                    <option value="POPULARES">POPULARES</option>
                    <option value="NOVEDADES">NOVEDADES</option>
                </select>
            </div>
            
            {/* PRODUCTO CON SABORES */}
            <div className="flex items-center space-x-2 pt-6">
                <input
                    id="hasFlavors"
                    type="checkbox"
                    checked={hasFlavors}
                    onChange={(e) => setHasFlavors(e.target.checked)}
                    className="h-4 w-4 text-emerald-600 border-stone-600 rounded bg-stone-700"
                />
                <label htmlFor="hasFlavors" className="text-sm text-zinc-200">Producto con sabores</label>
            </div>
            
             {/* VISIBLE */}
            <div className="flex items-center space-x-2 pt-6">
                <input
                    id="visible"
                    type="checkbox"
                    checked={visible}
                    onChange={(e) => setVisible(e.target.checked)}
                    className="h-4 w-4 text-emerald-600 border-stone-600 rounded bg-stone-700"
                />
                <label htmlFor="visible" className="text-sm text-zinc-200">Visible</label>
            </div>
        </div>

        {/* SABORES */}
        <div className="mt-4">
            <label className="block text-sm font-medium text-zinc-400 mb-1">Sabores (coma)</label>
            <input
                name="flavors"
                value={flavors.join(', ') || ''} 
                onChange={(e) => {
                    // Convierte la cadena de texto a un array de sabores
                    setFlavors(e.target.value.split(',').map(s => s.trim()).filter(s => s.length > 0));
                }}
                disabled={!hasFlavors}
                className={`w-full px-3 py-2 rounded ring-1 text-sm text-zinc-100 ${hasFlavors ? 'bg-[#141619] ring-stone-800' : 'bg-[#1e1e1e] ring-stone-900 cursor-not-allowed'}`}
                placeholder="Ej: Tabaco, Mixed Berries, Mint"
            />
        </div>
        
        {/* PLUSES (Checkboxes) */}
        <div className="mt-4">
            <label className="block text-sm font-medium text-zinc-400 mb-2">Pluses</label>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {availablePluses.map(plusName => (
                    <div key={plusName} className="flex items-center space-x-2">
                        <input
                            id={`create-plus-${plusName}`}
                            type="checkbox"
                            checked={pluses.includes(plusName)}
                            onChange={(e) => handlePlusChange(plusName, e.target.checked)}
                            className="h-4 w-4 text-emerald-600 border-stone-600 rounded bg-stone-700"
                        />
                        <label htmlFor={`create-plus-${plusName}`} className="text-xs text-zinc-200 uppercase">{plusName}</label>
                    </div>
                ))}
            </div>
        </div>


        {/* IMAGEN Y BOTONES */}
        <div className="pt-4 flex items-end justify-between border-t border-stone-800">
            {/* Campo de Imagen */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-400">Imagen</label>
                <div className="flex items-center gap-3">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            setImage(file ?? null);
                            if (file) {
                                setPreview(URL.createObjectURL(file));
                            }
                        }}
                        className="text-sm text-zinc-400 file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-zinc-700 file:text-white hover:file:bg-zinc-600"
                    />

                    {preview && (
                        <img src={preview} alt="Vista previa" className="h-12 w-12 rounded-md object-cover" />
                    )}
                </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-2">
                <button 
                    className="px-3 py-2 bg-zinc-700 rounded text-white hover:bg-zinc-600 text-sm" 
                    onClick={onClose}
                >
                    Cancelar
                </button>

                <button 
                    className="px-3 py-2 bg-emerald-600 rounded text-white hover:bg-emerald-700 text-sm" 
                    onClick={submit}
                >
                    Crear Producto
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}