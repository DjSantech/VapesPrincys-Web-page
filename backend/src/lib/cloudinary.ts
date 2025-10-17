// src/config/cloudinary.ts
import { v2 as cloudinary } from "cloudinary";

const {
  CLOUDINARY_URL, // opcional (cadena única)
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} = process.env;

if (!CLOUDINARY_URL && (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET)) {
  // Log amigable para debug (no imprimir el secret completo)
  // eslint-disable-next-line no-console
  console.error("Cloudinary ENV faltantes:", {
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY_PREFIX: (CLOUDINARY_API_KEY || "").slice(0, 4) + "…",
    HAS_SECRET: !!CLOUDINARY_API_SECRET,
  });
  throw new Error("Faltan variables de Cloudinary en .env");
}

// Si tienes CLOUDINARY_URL, Cloudinary ya parsea todo de esa variable.
// Si no, usamos las 3 variables separadas.
cloudinary.config(
  CLOUDINARY_URL
    ? { cloudinary_url: CLOUDINARY_URL }
    : {
        cloud_name: CLOUDINARY_CLOUD_NAME,
        api_key: CLOUDINARY_API_KEY,
        api_secret: CLOUDINARY_API_SECRET,
      }
);

export default cloudinary;
