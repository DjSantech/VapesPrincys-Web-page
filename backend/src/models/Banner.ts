import { Schema, model, Document } from "mongoose";

export interface IBannerDay {
  category: string;
  vapeId: string;
}

// 👇 EXPRTAMOS BannerDays (ANTES NO ESTABA EXPORTADO)
export interface BannerDays {
  Lunes?: IBannerDay | null;
  Martes?: IBannerDay | null;
  Miércoles?: IBannerDay | null;
  Jueves?: IBannerDay | null;
  Viernes?: IBannerDay | null;
  Sábado?: IBannerDay | null;
  Domingo?: IBannerDay | null;
}

// El documento final combina mongoose Document con BannerDays
export interface IBanner extends Document, BannerDays {}

const daySchema = new Schema<IBannerDay>({
  category: { type: String, required: true },
  vapeId: { type: String, required: true },
});

const bannerSchema = new Schema<IBanner>(
  {
    Lunes: { type: daySchema, default: null },
    Martes: { type: daySchema, default: null },
    Miércoles: { type: daySchema, default: null },
    Jueves: { type: daySchema, default: null },
    Viernes: { type: daySchema, default: null },
    Sábado: { type: daySchema, default: null },
    Domingo: { type: daySchema, default: null },
  },
  { versionKey: false }
);

export const Banner = model<IBanner>("Banner", bannerSchema);
