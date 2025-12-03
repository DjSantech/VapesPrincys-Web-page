export interface BannerDay {
  category: string;
  vapeId: string;
  bannerImageUrl?: string;
  descuento: number;
}

export interface BannerWeek {
  Lunes?: BannerDay | null;
  Martes?: BannerDay | null;
  Miércoles?: BannerDay | null;
  Jueves?: BannerDay | null;
  Viernes?: BannerDay | null;
  Sábado?: BannerDay | null;
  Domingo?: BannerDay | null;
}
export type BannerDayName =
  | "Lunes"
  | "Martes"
  | "Miércoles"
  | "Jueves"
  | "Viernes"
  | "Sábado"
  | "Domingo";

export async function getBanner(): Promise<BannerWeek | null> {
  const base =
    import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";

  const res = await fetch(`${base}/banner`);
  if (!res.ok) return null;

  return res.json();
}

export async function uploadBannerImage(day: string, file: File) {
    const base = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
    const token = localStorage.getItem('token'); // 🚀 Obtener el token

    const fd = new FormData();
    fd.append("image", file);

    const res = await fetch(`${base}/banner/${day}/image`, {

        method: "PATCH",
        headers: {
            // 🚀 Incluir el header de autorización
            'Authorization': `Bearer ${token}`, 
            // Omitimos 'Content-Type': 'multipart/form-data' porque FormData lo maneja.
        },
        body: fd,
    });

    if (!res.ok) {
        // Mejorar el manejo de errores para el frontend
        const errorData = await res.json().catch(() => ({ message: "Error desconocido al subir imagen." }));
        throw new Error(errorData.message || `Error al subir imagen del banner para el día ${day}`);
    }

    return res.json();
}


export async function patchBannerData(body: BannerWeek): Promise<void> {
    const base = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
    const token = localStorage.getItem('token'); // Necesitas el token de autenticación

    const res = await fetch(`${base}/banner`, {
        method: "POST", // o PATCH, según tu backend
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`, // 🛑 IMPORTANTE: Añadir el token de autenticación
        },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Error desconocido." }));
        throw new Error(errorData.message || "Error de servidor al guardar la configuración del banner.");
    }
}