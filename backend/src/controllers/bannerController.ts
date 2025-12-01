import { Request, Response } from "express";
import { Banner, IBanner, IBannerDay,BannerDays } from "../models/Banner";
import { uploadBufferToCloudinary } from "../lib/uploadBufferToCloudinary"; 

const FOLDER_DESTINO = 'banners-princisvapes'
// GET /api/banner
export const getBanner = async (req: Request, res: Response) => {
  try {
    const banner = await Banner.findOne();
    res.json(banner);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el banner" });
  }
};

export const updateBannerDayImage = async (req, res) => {
  try {
    const { day } = req.params;
    if (!req.file) return res.status(400).json({ error: "Imagen requerida" });

    const file = req.file.path;
    const uploaded = await uploadBufferToCloudinary(file, FOLDER_DESTINO);

    let banner = await Banner.findOne();
    if (!banner) banner = await Banner.create({});

    if (!banner[day]) banner[day] = { category: "", vapeId: "" };

    banner[day].imageUrl = uploaded.secure_url;
    await banner.save();

    res.json({ ok: true, url: uploaded.secure_url, banner });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al subir imagen" });
  }
};

// POST /api/banner  → Guardar TODO el banner
export const updateBanner = async (req: Request, res: Response) => {
  try {
    const data = req.body as Partial<IBanner>;

    let banner = await Banner.findOne();
    if (!banner) {
      banner = await Banner.create(data);
    } else {
      Object.assign(banner, data);
      await banner.save();
    }

    res.json({ ok: true, banner });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el banner" });
  }
};

// PATCH /api/banner/:day  → Actualizar **solo un día**
export const updateBannerDay = async (req: Request, res: Response) => {
  try {
    const day = req.params.day as keyof BannerDays;
    const { category, vapeId } = req.body as IBannerDay;

    let banner = await Banner.findOne();
    if (!banner) banner = await Banner.create({});

    banner[day] = { category, vapeId };
    await banner.save();

    res.json({ ok: true, banner });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el día del banner" });
  }
};

