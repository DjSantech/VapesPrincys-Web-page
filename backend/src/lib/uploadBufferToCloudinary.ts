import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

/**
 * Sube un archivo (buffer) a Cloudinary usando streams.
 * @param buffer - Buffer del archivo.
 * @param folder - Carpeta dentro de Cloudinary.
 * @param fileName - (Opcional) Nombre único (SKU) para evitar duplicados.
 */
export function uploadBufferToCloudinary(
  buffer: Buffer,
  folder: string,
  fileName?: string // 👈 Añadimos este parámetro opcional
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    // 1. Configuramos las opciones de subida
    const options: any = { 
      folder,
      resource_type: "auto",
      overwrite: true, // 👈 Permite reemplazar si el public_id es igual
      invalidate: true // 👈 Limpia la caché del CDN para mostrar la nueva imagen
    };

    // 2. Si enviamos un fileName (SKU), lo usamos como public_id
    if (fileName) {
      options.public_id = fileName;
    }

    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err || !result) return reject(err);
      resolve(result);
    });

    stream.end(buffer);
  });
}