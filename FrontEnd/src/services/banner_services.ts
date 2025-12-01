export interface BannerDay {
  category: string;
  vapeId: string;
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

export async function getBanner(): Promise<BannerWeek | null> {
  const base =
    import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";

  const res = await fetch(`${base}/banner`);
  if (!res.ok) return null;

  return res.json();
}

export async function uploadBannerImage(day: string, file: File) {
  const base = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";

  const fd = new FormData();
  fd.append("image", file);

  const res = await fetch(`${base}/banner/${day}/image`, {
    method: "PATCH",
    body: fd,
  });

  if (!res.ok) throw new Error("Error al subir imagen del banner");

  return res.json();
}