// src/views/AdminDashboard/sections/BannerSection.tsx

import { useEffect, useState } from "react";
import { toast } from "sonner";



import type { AdminCategory, AdminProduct } from "../../../services/admin";
import {
  uploadBannerImage,
  patchBannerData,
  type BannerWeek,
} from "../../../services/banner_services";

type BannerDays =
  | "Lunes"
  | "Martes"
  | "Miércoles"
  | "Jueves"
  | "Viernes"
  | "Sábado"
  | "Domingo";

const weekDays: BannerDays[] = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

interface BannerSectionProps {
  show: boolean;
  onClose: () => void;
  categories: AdminCategory[];
  products: AdminProduct[];
  initialBanner: BannerWeek | null; // viene desde getBanner()
}

export function BannerSection({
  show,
  onClose,
  categories,
  products,
  initialBanner,
}: BannerSectionProps) {
  const [bannerCategory, setBannerCategory] = useState<Record<string, string>>(
    {}
  );
  const [bannerVape, setBannerVape] = useState<Record<string, string>>({});
  const [bannerDiscount, setBannerDiscount] = useState<Record<string, number>>(
    {}
  );
  const [bannerImageDrafts, setBannerImageDrafts] = useState<
    Record<string, { imageFile?: File | null; previewUrl?: string }>
  >({});

  // ============================
  // CARGAR DATA INICIAL
  // ============================
  useEffect(() => {
    if (!initialBanner) return;

    const catsObj: Record<string, string> = {};
    const vapeObj: Record<string, string> = {};
    const discountObj: Record<string, number> = {};

    for (const day of weekDays) {
      catsObj[day] = initialBanner[day]?.category ?? "";
      vapeObj[day] = initialBanner[day]?.vapeId ?? "";
      discountObj[day] = initialBanner[day]?.descuento ?? 0;
    }

    setBannerCategory(catsObj);
    setBannerVape(vapeObj);
    setBannerDiscount(discountObj);
  }, [initialBanner]);

  // ============================
  // GUARDAR BANNER
  // ============================
  const onSave = async () => {
    const toastId = toast.loading("Guardando banner...");

    try {
      const body: BannerWeek = {
        Lunes: null,
        Martes: null,
        Miércoles: null,
        Jueves: null,
        Viernes: null,
        Sábado: null,
        Domingo: null,
      };

      for (const day of weekDays) {
        const category = bannerCategory[day];
        const vapeId = bannerVape[day];
        const descuento = bannerDiscount[day];

        // SIN CATEGORIA → día vacío
        if (!category) {
          body[day] = null;
          continue;
        }

        // SUBIR IMAGEN SOLO SI EL USUARIO SUBIÓ UNA NUEVA
        if (bannerImageDrafts[day]?.imageFile) {
          const res = await uploadBannerImage(
            day,
            bannerImageDrafts[day].imageFile!
          );
          bannerImageDrafts[day]!.previewUrl = res.bannerImageUrl;
        }

        // GUARDAR DATA
        body[day] = { category, vapeId, descuento };
      }

      await patchBannerData(body);

      toast.success("Banner actualizado correctamente", { id: toastId });
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Error guardando banner", { id: toastId });
    }
  };

  if (!show) return null;

  // ============================
  // UI
  // ============================
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-3">
      <div className="w-full max-w-2xl rounded-2xl border border-stone-800 bg-[#1a1d1f] p-5">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-zinc-100">
            Banner de la semana
          </h2>
          <button
            className="text-sm rounded-lg bg-[#2a2a28] border border-stone-700 px-2 py-1 text-zinc-200 hover:bg-[#323230]"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <h3 className="text-sm text-zinc-400 font-semibold mb-3 border-t border-stone-800 pt-3">
            Configuración por día
          </h3>

          {weekDays.map((day) => {
            const selectedCat = bannerCategory[day] ?? "";

            const filteredProducts = products.filter(
              (p) => p.category === selectedCat
            );

            return (
              <div
                key={day}
                className="rounded-xl border border-stone-800 p-4 bg-[#0f1113]"
              >
                <h3 className="text-sm text-zinc-200 font-semibold mb-2">
                  {day}
                </h3>

                {/* Categoría */}
                <div className="mb-2">
                  <label className="text-xs text-zinc-400">Categoría</label>
                  <select
                    value={selectedCat}
                    onChange={(e) =>
                      setBannerCategory((prev) => ({
                        ...prev,
                        [day]: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg bg-[#1a1d1f] ring-1 ring-stone-800 px-2 py-1 text-sm text-zinc-100"
                  >
                    <option value="">— Selecciona —</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Vape */}
                <div className="mb-2">
                  <label className="text-xs text-zinc-400">Vape del día</label>
                  <select
                    value={bannerVape[day] ?? ""}
                    onChange={(e) =>
                      setBannerVape((prev) => ({
                        ...prev,
                        [day]: e.target.value,
                      }))
                    }
                    disabled={!selectedCat}
                    className="w-full rounded-lg bg-[#1a1d1f] ring-1 ring-stone-800 px-2 py-1 text-sm text-zinc-100"
                  >
                    <option value="">— Selecciona —</option>
                    {filteredProducts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Descuento */}
                <div className="mb-2">
                  <label className="text-xs text-zinc-400">
                    Descuento (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={bannerDiscount[day] ?? 0}
                    onChange={(e) =>
                      setBannerDiscount((prev) => ({
                        ...prev,
                        [day]: Number(e.target.value),
                      }))
                    }
                    className="w-full rounded-lg bg-[#1a1d1f] ring-1 ring-stone-800 px-2 py-1 text-sm text-zinc-100"
                  />
                </div>

                {/* Imagen */}
                <div>
                  <label className="text-xs text-zinc-400">
                    Imagen del banner
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null;
                      if (!file) return;

                      const previewUrl = URL.createObjectURL(file);

                      setBannerImageDrafts((prev) => ({
                        ...prev,
                        [day]: { imageFile: file, previewUrl },
                      }));
                    }}
                    className="w-full bg-[#1a1d1f] border border-stone-800 rounded-lg px-2 py-1 text-sm text-zinc-100"
                  />

                  {bannerImageDrafts[day]?.previewUrl && (
                    <img
                      src={bannerImageDrafts[day]!.previewUrl}
                      className="mt-2 w-full h-40 object-cover rounded-lg border border-stone-700"
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-4 flex justify-end">
          <button
            className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-sm text-white"
            onClick={onSave}
          >
            Guardar banner
          </button>
        </div>
      </div>
    </div>
  );
}
