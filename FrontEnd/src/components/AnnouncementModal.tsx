import { useState, useEffect } from 'react';
import { optimizeImage } from '../utils/cloudinary';
import { getAnnouncementSettings } from '../services/settings_services';
import { X } from 'lucide-react'; // Si no usas lucide, puedes usar un icono de texto o SVG

export default function AnnouncementModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    const loadAnnouncement = async () => {
      try {
        // 1. Buscamos la configuración en la base de datos
        const settings = await getAnnouncementSettings();
        
        // 2. Verificamos que esté activo y tenga imagen
        if (settings.announcementIsActive && settings.announcementImageUrl) {
          
          // 3. Verificamos si ya se mostró en esta sesión (para no ser molesto)
          const alreadyShown = sessionStorage.getItem('announcement_shown');
          
          if (!alreadyShown) {
            setImageUrl(settings.announcementImageUrl);
            // Pequeño delay de 1.5s para que la web cargue antes de mostrarlo
            setTimeout(() => setIsOpen(true), 1500);
          }
        }
      } catch (error) {
        console.error("Error al cargar el anuncio:", error);
      }
    };

    loadAnnouncement();
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    // Guardamos en sessionStorage que ya se vio (se borra al cerrar la pestaña)
    sessionStorage.setItem('announcement_shown', 'true');
  };

  if (!isOpen || !imageUrl) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-500">
      <div className="relative max-w-4xl w-full animate-in zoom-in duration-300">
        
        {/* Botón de cerrar con estilo flotante */}
        <button 
          onClick={handleClose}
          className="absolute -top-3 -right-3 z-[110] bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-2xl hover:bg-red-500 hover:scale-110 transition-all font-bold text-2xl border-2 border-white/20"
          title="Cerrar anuncio"
        >
          <X size={24} />
          {/* Si no tienes Lucide-react, usa: &times; */}
        </button>

        {/* Contenedor de la imagen con bordes curvos y sombra */}
        <div className="rounded-2xl overflow-hidden border border-stone-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-[#0f1113]">
          <img 
            src={optimizeImage(imageUrl, 1200)} 
            alt="Anuncio Promocional" 
            className="w-full h-auto max-h-[85vh] object-contain block"
          />
        </div>

        {/* Opcional: Área de cierre al hacer clic fuera (overlay) */}
        <div 
          className="absolute inset-0 -z-10" 
          onClick={handleClose}
        ></div>
      </div>
    </div>
  );
}