import imageCompression from "browser-image-compression";

const API_BASE =
  (import.meta.env.VITE_API_URL as string) ?? "http://localhost:8080/api";

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("admin_token") ?? ""}`,
});

export interface AnnouncementSettings {
  announcementImageUrl: string;
  announcementIsActive: boolean;
}

/**
 * SUBIR IMAGEN AL BACKEND (Y DE AHÍ A CLOUDINARY)
 */
export async function uploadAnnouncementImage(file: File): Promise<string> {
  const options = {
    maxSizeMB: 0.8,
    maxWidthOrHeight: 1200,
    useWebWorker: true
  };

  let fileToUpload = file;
  try {
    fileToUpload = await imageCompression(file, options);
  } catch (error) {
    console.error("Error comprimiendo", error);
  }

  const fd = new FormData();
  // Usamos "image" porque es el nombre que definimos en upload.single("image") en el backend
  fd.append("image", fileToUpload); 

  // 🚩 CORRECCIÓN: Apuntamos a la nueva ruta que creamos en Settings
  const res = await fetch(`${API_BASE}/settings/upload-image`, { 
    method: "POST",
    headers: { ...authHeader() },
    body: fd,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Error al subir la imagen del anuncio");
  }
  
  const data = await res.json();
  // El backend que configuramos devuelve { imageUrl: result.secure_url }
  return data.imageUrl; 
}

/**
 * ACTUALIZAR LOS DATOS EN MONGODB
 */
export async function updateAnnouncementSettings(imageUrl: string, isActive: boolean) {
  const res = await fetch(`${API_BASE}/settings/announcement`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
    },
    body: JSON.stringify({ imageUrl, isActive }),
  });

  if (!res.ok) throw new Error("Error al guardar la configuración en la base de datos");
  return await res.json();
}

/**
 * OBTENER CONFIGURACIÓN ACTUAL
 */
export async function getAnnouncementSettings(): Promise<AnnouncementSettings> {
    try {
      const res = await fetch(`${API_BASE}/settings/announcement`);
      if (!res.ok) throw new Error("Error al obtener el anuncio");
      return await res.json();
    } catch (error) {
      console.error(error);
      return { announcementImageUrl: "", announcementIsActive: false };
    }
}