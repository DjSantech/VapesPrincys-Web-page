import { Request, Response } from "express";
import { Banner, IBanner, IBannerDay,BannerDays } from "../models/Banner";
import { uploadBufferToCloudinary } from "../lib/uploadBufferToCloudinary"; 

interface FileRequest extends Request {
  // Asumimos que la propiedad 'file' usa el tipo de archivo de Multer.
  // En muchos entornos, el tipo correcto es Express.Multer.File (si está configurado globalmente)
  // o el tipo de File que importaste (como se hace con 'multer').
  file: Express.Multer.File;
}

const FOLDER_DESTINO = 'banners-princisvapes'
// GET /api/banner
export const getBanner = async (req: Request, res: Response) => {
  try {
    const banner = await Banner.findOne();

    // Si nunca se ha creado un banner, devolvemos uno vacío
    if (!banner) {
      return res.json({
        Lunes: null,
        Martes: null,
        Miércoles: null,
        Jueves: null,
        Viernes: null,
        Sábado: null,
        Domingo: null
      });
    }

    res.json(banner);
    
  } catch (error) {
    console.error("Error en GET /banner:", error);
    res.status(500).json({ error: "Error al obtener el banner" });
  }
};

export const updateBannerDayImage = async (req: FileRequest, res: Response) => {
  console.log("🚨 FILE RECIBIDO:", req.file);
    const day = req.params.day as keyof BannerDays;

    if (!req.file) {
        return res.status(400).json({ error: "Imagen requerida" });
    }

    try {
        // 1. Asegurar que exista un documento Banner
        let bannerDoc = await Banner.findOne();
        if (!bannerDoc) {
            bannerDoc = await Banner.create({
                Lunes: {},
                Martes: {},
                Miercoles: {},
                Jueves: {},
                Viernes: {},
                Sabado: {},
                Domingo: {}
            });
        }

        // 2. Subir imagen a Cloudinary
        const file = req.file.buffer;
        const uploaded = await uploadBufferToCloudinary(file, FOLDER_DESTINO);
        const imageUrl = uploaded.secure_url;

        // 3. Actualizar dinámicamente el campo correspondiente
        const updateField = `${day}.bannerImageUrl`;

        await Banner.updateOne(
            { _id: bannerDoc._id },
            { $set: { [updateField]: imageUrl } }
        );

        // 4. Respuesta
        res.json({
            ok: true,
            message: `URL de banner para ${day} guardada.`,
            bannerImageUrl: imageUrl
        });

    } catch (err) {
        console.error("Error al subir imagen y actualizar DB:", err);
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
      // 👇 Aquí reemplazamos Object.assign por actualización inteligente
      for (const day of Object.keys(data)) {
        const dayData = data[day as keyof IBanner];
        
        // Si el día viene vacío → mantener null
        if (!dayData) {
          banner[day] = null;
          continue;
        }

        // 👇 Mantener la imagen PREVIAMENTE guardada
        const previousUrl = banner[day]?.bannerImageUrl || null;

        banner[day] = {
          ...banner[day],        // ❗ mantiene bannerImageUrl
          ...dayData,            // ❗ actualiza category, vapeId, descuento
          bannerImageUrl: previousUrl, // ❗ se asegura de NO borrar la URL
        };
      }

      await banner.save();
    }

    res.json({ ok: true, banner });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar el banner" });
  }
};


// PATCH /api/banner/:day  → Actualizar **solo un día**
export const updateBannerDay = async (req: Request, res: Response) => {
  try {
    const day = req.params.day as keyof BannerDays;
    const { category, vapeId, descuento } = req.body as IBannerDay;

    let banner = await Banner.findOne();
    if (!banner) {
      banner = await Banner.create({});
    }

    // 🔥 mantener la url guardada
    const previousUrl = banner[day]?.bannerImageUrl || null;

    banner[day] = {
      category,
      vapeId,
      descuento,
      bannerImageUrl: previousUrl // NO lo sobrescribas jamás
    };

    await banner.save();

    res.json({ ok: true, banner });

  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el día del banner" });
  }
};


