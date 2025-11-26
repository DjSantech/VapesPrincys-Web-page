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
    (import.meta.env.VITE_API_URL as string | undefined) ??
    "http://localhost:8080/api";

  const res = await fetch(`${base}/banner`);
  if (!res.ok) return null;
  return await res.json();
}
