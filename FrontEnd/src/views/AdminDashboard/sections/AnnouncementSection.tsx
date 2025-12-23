// src/views/admin/sections/AnnouncementSection.tsx
import { useState } from 'react';
import { optimizeImage } from '../../../utils/cloudinary';
// 1. Importamos los servicios que creamos
import { uploadAnnouncementImage, updateAnnouncementSettings } from '../../../services/settings_services';

interface Props {
  currentImageUrl: string;
  onUpdate: (newUrl: string) => void;
}

export function AnnouncementSection({ currentImageUrl, onUpdate }: Props) {
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      // 2. Usamos el servicio para subir a Cloudinary (ya tiene compresión y usa "image")
      const newUrl = await uploadAnnouncementImage(file);

      // 3. Usamos el servicio para guardar la URL en MongoDB
      await updateAnnouncementSettings(newUrl, true);

      // 4. Actualizamos el estado visual en el Dashboard
      onUpdate(newUrl);
      alert("¡Anuncio actualizado correctamente!");
      
    } catch  {
        alert("Error al actualizar el anuncio");
    }
  };

  const handleDisable = async () => {
    if (!window.confirm("¿Estás seguro de desactivar el anuncio?")) return;
    
    setLoading(true);
    try {
      // Enviamos vacío para desactivar
      await updateAnnouncementSettings("", false);
      onUpdate("");
    } catch (error) {
      console.error(error);
      alert("Error al desactivar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 bg-[#1a1d1f] rounded-xl border border-stone-800">
      <div className="flex items-center justify-between">
        <h4 className="text-zinc-100 font-medium">Imagen del Anuncio (Pop-up)</h4>
        {currentImageUrl && (
           <button 
             onClick={handleDisable}
             disabled={loading}
             className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50"
           >
             Desactivar Anuncio
           </button>
        )}
      </div>

      <div className="relative aspect-video rounded-lg overflow-hidden bg-black border border-stone-700">
        {currentImageUrl ? (
          <img 
            src={optimizeImage(currentImageUrl, 600)} 
            className={`w-full h-full object-cover transition-opacity duration-300 ${loading ? 'opacity-20' : 'opacity-50'}`} 
            alt="Vista previa"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
            No hay anuncio activo
          </div>
        )}
        
        <label className={`absolute inset-0 flex items-center justify-center ${loading ? 'cursor-not-allowed' : 'cursor-pointer'} hover:bg-black/40 transition-colors`}>
          <span className="bg-white text-black px-4 py-2 rounded-lg font-bold text-sm shadow-lg">
            {loading ? "Procesando..." : "Cambiar Imagen"}
          </span>
          {!loading && (
            <input 
              type="file" 
              className="hidden" 
              onChange={handleFileChange} 
              accept="image/*" 
            />
          )}
        </label>
      </div>
      <p className="text-[10px] text-zinc-500 uppercase tracking-wider">
        Recomendado: 1200x800px (Formato horizontal o cuadrado).
      </p>
    </div>
  );
}