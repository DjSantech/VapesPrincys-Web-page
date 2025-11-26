import { Request, Response } from "express";
import { Banner, IBanner, IBannerDay,BannerDays } from "../models/Banner";

// GET /api/banner
export const getBanner = async (req: Request, res: Response) => {
  try {
    const banner = await Banner.findOne();
    res.json(banner);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el banner" });
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

