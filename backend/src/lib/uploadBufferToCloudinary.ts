// src/lib/uploadBufferToCloudinary.ts
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

// Configuración de Cloudinary (usa tus variables del .env)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

/**
 * Sube un archivo (buffer) a Cloudinary usando streams.
 * @param buffer - Buffer del archivo (viene de multer.memoryStorage()).
 * @param folder - Carpeta dentro de Cloudinary (por ejemplo: "vapitos/products").
 * @returns Promesa con la respuesta de Cloudinary (incluye secure_url, public_id, etc.)
 */
export function uploadBufferToCloudinary(
  buffer: Buffer,
  folder: string
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (err, result) => {
      if (err || !result) return reject(err);
      resolve(result);
    });
    stream.end(buffer);
  });
}
