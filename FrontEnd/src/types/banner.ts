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
