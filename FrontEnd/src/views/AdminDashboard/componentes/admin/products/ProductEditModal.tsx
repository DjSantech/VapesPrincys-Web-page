// src/views/AdminDashboard/componentes/admin/products/ProductEditModal.tsx

import { useState } from "react";
// Importa el tipo de producto completo que manejas en tu backend
import type { AdminProduct } from "../../../../../services/admin"; 
import { patchProduct } from "../../../../../services/products.service";


// Componente auxiliar para simplificar los inputs
interface InputGroupProps {
  label: string;
  name: keyof AdminProduct; // Asegura que el nombre sea una clave válida de AdminProduct
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  type: string;
}

const InputGroup: React.FC<InputGroupProps> = ({ label, name, value, onChange, type }) => (
    <div className="space-y-1">
        <label className="block text-sm font-medium text-zinc-400">{label}</label>
        <input
            name={name as string}
            type={type}
            value={value}
            onChange={onChange}
            className="w-full bg-[#141619] px-3 py-2 rounded ring-1 ring-stone-800 text-sm text-zinc-100"
            // Deshabilitar la rueda de scroll en inputs numéricos
            onWheel={(e) => e.currentTarget.blur()} 
        />
    </div>
);


interface ProductEditModalProps {
  product: AdminProduct;
  onClose: () => void;
  // onSave espera el producto actualizado para actualizar el estado global en ProductsSection
  onSave: (updatedProduct: AdminProduct) => void; 
  // Podrías añadir props para categorías y pluses disponibles si el producto es muy complejo
}

export function ProductEditModal({ product, onClose, onSave }: ProductEditModalProps) {
  // Inicializamos el estado del formulario con los datos del producto
  const [formData, setFormData] = useState<AdminProduct>(product);
  const [isSaving, setIsSaving] = useState(false);

  // Lista de Pluses disponibles (usada para renderizar los checkboxes, DEBES AJUSTAR ESTO)
  // Idealmente, esta lista vendría del AdminDashboard como una prop.
  const availablePluses = ['SALUD', 'SALIDA', 'KIT THC', 'THC RECARGA', 'THC PLUS', 'SMOKE', 'DINAMICO', 'JUGOOSO', 'QUALITY', 'COMESTIBLE', 'UNLIMITED', 'VIP'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ 
            ...prev, 
            [name]: checked 
        }));
    } else if (type === 'number') {
        setFormData(prev => ({ 
            ...prev, 
            [name]: Number(value) 
        }));
    } else {
        setFormData(prev => ({ 
            ...prev, 
            [name]: value 
        }));
    }
  };
  
  // Manejar cambios en Pluses (Checkboxes)
  const handlePlusChange = (plusName: string, isChecked: boolean) => {
    const currentPluses = formData.pluses || []; 
    if (isChecked) {
        setFormData(prev => ({
            ...prev,
            pluses: Array.from(new Set([...currentPluses, plusName])), // Añadir y evitar duplicados
        }));
    } else {
        setFormData(prev => ({
            ...prev,
            pluses: currentPluses.filter(p => p !== plusName), // Quitar
        }));
    }
  };

  const handleUpdate = async () => {
    // Validación básica
    if (!formData.name || !formData.sku) {
        alert("Nombre y SKU son obligatorios.");
        return;
    }

    setIsSaving(true);
    try {
        const updatedProduct = await patchProduct(product.id, {
            sku: formData.sku,
            name: formData.name,
            price: formData.price,
            description: formData.description,
            stock: formData.stock,
            puffs: formData.puffs,
            ml: formData.ml,
            visible: formData.visible,
            category: formData.category,
            flavors: formData.flavors,
            hasFlavors: formData.hasFlavors,
            pluses: formData.pluses,
            // NOTA: Omitimos 'imageUrl' y 'images' ya que se actualizan con patchProductImage
        });

        // 2. Ejecuta la función del padre (ProductsSection) con el producto que devolvió el servidor
        onSave(updatedProduct);
    } catch (err) {
        console.error("Error al actualizar producto:", err);
        alert("Error al actualizar producto. Revisa la consola.");
    } finally {
        setIsSaving(false);
    }
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center backdrop-blur-sm z-50">
      <div className="bg-[#0f1113] p-6 rounded-xl border border-stone-800 space-y-4 w-full max-w-5xl max-h-[90vh] overflow-y-auto text-zinc-100">

        {/* HEADER DEL MODAL (similar a la imagen) */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-700">
            <h3 className="text-xl font-semibold text-zinc-100">{formData.name}</h3>
            <div className="flex gap-2">
                <button 
                    className={`px-3 py-1 rounded text-white text-sm transition ${isSaving ? 'bg-orange-800' : 'bg-orange-600 hover:bg-orange-700'}`} 
                    onClick={handleUpdate}
                    disabled={isSaving}
                >
                    {isSaving ? "Guardando..." : "Actualizar"}
                </button>
                <button 
                    className="bg-red-600 px-3 py-1 rounded text-white text-sm hover:bg-red-700" 
                    onClick={onClose}
                >
                    Cerrar
                </button>
            </div>
        </div>
        
        {/* ID */}
        <p className="text-xs text-zinc-400">ID: {formData.id}</p>

        <InputGroup 
            label="Nombre del Producto" 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            type="text" 
        />

        {/* DESCRIPCIÓN */}
        <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Descripción</label>
            <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                className="w-full bg-[#141619] px-3 py-2 rounded ring-1 ring-stone-800 text-sm text-zinc-100 h-24"
                placeholder="Descripción del producto..."
            />
        </div>

        {/* GRID DE CAMPOS PRINCIPALES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* SKU */}
            <InputGroup label="SKU" name="sku" value={formData.sku} onChange={handleChange} type="text" />
            
            {/* PRECIO */}
            <InputGroup label="Precio (COP)" name="price" value={formData.price} onChange={handleChange} type="number" />
            
            {/* STOCK */}
            <InputGroup label="Stock" name="stock" value={formData.stock} onChange={handleChange} type="number" />
            
            {/* PUFFS */}
            <InputGroup label="Puffs" name="puffs" value={formData.puffs} onChange={handleChange} type="number" />
            
            {/* ML */}
            <InputGroup label="ml" name="ml" value={formData.ml} onChange={handleChange} type="number" />

            {/* CATEGORÍA (DEBE SER UN SELECT EN PRODUCCIÓN) */}
            <div className="space-y-1">
                <label className="block text-sm font-medium text-zinc-400">Categoría</label>
                <select
                    name="category"
                    value={formData.category || ''}
                    onChange={(e) => handleChange(e as React.ChangeEvent<HTMLSelectElement>)}
                    className="w-full bg-[#141619] px-3 py-2 rounded ring-1 ring-stone-800 text-sm text-zinc-100 h-10 appearance-none"
                >
                    {/* Placeholder si no hay categorías disponibles */}
                    <option value="" disabled>Seleccionar Categoría</option> 
                    {/* Idealmente, mapearías las categorías pasadas como props: */}
                    {/* {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)} */}
                    <option value="POPULARES">POPULARES</option>
                    <option value="NOVEDADES">NOVEDADES</option>
                    {/* Valor actual si no coincide con opciones */}
                    {formData.category && !['POPULARES', 'NOVEDADES'].includes(formData.category) && (
                        <option value={formData.category}>{formData.category} (Personalizada)</option>
                    )}
                </select>
            </div>

            {/* PRODUCTO CON SABORES */}
            <div className="flex items-center space-x-2 pt-6">
                <input
                    id="hasFlavors"
                    type="checkbox"
                    name="hasFlavors"
                    checked={formData.hasFlavors}
                    onChange={handleChange}
                    className="h-4 w-4 text-emerald-600 border-stone-600 rounded bg-stone-700"
                />
                <label htmlFor="hasFlavors" className="text-sm text-zinc-200">Producto con sabores</label>
            </div>

             {/* VISIBLE */}
            <div className="flex items-center space-x-2 pt-6">
                <input
                    id="visible"
                    type="checkbox"
                    name="visible"
                    checked={formData.visible}
                    onChange={handleChange}
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
                // Muestra el array de sabores como una cadena separada por coma
                value={formData.flavors.join(', ') || ''} 
                onChange={(e) => {
                    // Actualiza el estado como array de strings
                    setFormData(prev => ({
                        ...prev,
                        flavors: e.target.value.split(',').map(s => s.trim()).filter(s => s.length > 0)
                    }));
                }}
                className="w-full bg-[#141619] px-3 py-2 rounded ring-1 ring-stone-800 text-sm text-zinc-100"
                placeholder="Ej: Tabaco, Mixed Berries, Mint"
            />
        </div>
        
       

        {/* PLUSES (Checkboxes) */}
        <div className="mt-4">
            <label className="block text-sm font-medium text-zinc-400 mb-2">Pluses</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {availablePluses.map(plusName => (
                    <div key={plusName} className="flex items-center space-x-2">
                        <input
                            id={`plus-${plusName}`}
                            type="checkbox"
                            name={`plus-${plusName}`}
                            // Verifica si el plus actual está incluido en la lista del producto
                            checked={formData.pluses?.includes(plusName) ?? false}
                            onChange={(e) => handlePlusChange(plusName, e.target.checked)}
                            className="h-4 w-4 text-emerald-600 border-stone-600 rounded bg-stone-700"
                        />
                        <label htmlFor={`plus-${plusName}`} className="text-xs text-zinc-200 uppercase">{plusName}</label>
                    </div>
                ))}
            </div>
        </div>
        
        {/* Botón de cierre inferior */}
        <div className="flex justify-end pt-4">
             <button 
                className="px-3 py-1 bg-zinc-700 rounded text-white hover:bg-zinc-600" 
                onClick={onClose}
             >
                Cerrar sin guardar
             </button>
        </div>
        
      </div>
    </div>
  );
}