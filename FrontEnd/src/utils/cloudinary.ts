// src/utils/cloudinary.ts

export const optimizeImage = (url: string, width: number = 800): string => {
  if (!url) return "";
  
  // Si la imagen no es de Cloudinary, la devolvemos tal cual
  if (!url.includes("cloudinary.com")) return url;

  // Insertamos f_auto (formato automático como WebP)
  // q_auto (compresión automática)
  // w_X (redimensionar al ancho necesario para no descargar píxeles de más)
  const params = `f_auto,q_auto,w_${width}`;
  
  // Reemplazamos '/upload/' por '/upload/params/'
  return url.replace("/upload/", `/upload/${params}/`);
};