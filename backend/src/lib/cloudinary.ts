import { v2 as cloudinary } from "cloudinary";

const {
  CLOUDINARY_URL,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} = process.env;

if (!CLOUDINARY_URL && (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET)) {
  throw new Error("Faltan variables de Cloudinary en .env");
}

cloudinary.config(
  CLOUDINARY_URL
    ? { cloudinary_url: CLOUDINARY_URL }
    : {
        cloud_name: CLOUDINARY_CLOUD_NAME,
        api_key: CLOUDINARY_API_KEY,
        api_secret: CLOUDINARY_API_SECRET,
      }
);

/**
 * Extrae el Public ID de una URL de Cloudinary incluyendo carpetas.
 * Ejemplo: "https://.../v123/vapes/products/foto1.jpg" -> "vapes/products/foto1"
 */
export const getPublicIdFromUrl = (url: string): string | null => {
  if (!url) return null;
  try {
    const parts = url.split("/");
    // El ID con extensión es siempre el último elemento
    const fileNameWithExtension = parts.pop();
    if (!fileNameWithExtension) return null;
    
    const publicId = fileNameWithExtension.split(".")[0];

    // Buscamos dónde empieza la ruta de nuestras carpetas personalizadas
    // Esto asume que tus carpetas están bajo el prefijo "vapes"
    const vapesIndex = parts.indexOf("vapes");
    if (vapesIndex !== -1) {
      const folderPath = parts.slice(vapesIndex).join("/");
      return `${folderPath}/${publicId}`;
    }
    
    return publicId;
  } catch (error) {
    console.error("Error parseando URL de Cloudinary:", error);
    return null;
  }
};

/**
 * Elimina una imagen de Cloudinary a partir de su URL
 */
export const deleteImageFromCloudinary = async (sku: string) => {
  try {
    // IMPORTANTE: Debes incluir la ruta completa de la carpeta
    // Si en el upload usaste "vapes/products", aquí también.
    const publicId = `vapes/products/${sku}`;
    
    const result = await cloudinary.uploader.destroy(publicId);
    console.log("Resultado borrado Cloudinary:", result);
    return result;
  } catch (error) {
    console.error("Error al borrar imagen de Cloudinary:", error);
    throw error;
  }
};
export default cloudinary;