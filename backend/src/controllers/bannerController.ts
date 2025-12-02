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
    res.json(banner);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el banner" });
  }
};

export const updateBannerDayImage = async (req: FileRequest, res: Response) => {
    // 1. Validar el día de la semana y el archivo
    const day = req.params.day as keyof BannerDays; // Obtener el día
    if (!req.file) {
        return res.status(400).json({ error: "Imagen requerida" });
    }

    try {
        // 2. Subir la imagen a Cloudinary
        const file = req.file.buffer;
        const uploaded = await uploadBufferToCloudinary(file, FOLDER_DESTINO);
        const imageUrl = uploaded.secure_url; // URL pública de la imagen

        // 3. ✨ ACTUALIZACIÓN CRUCIAL: Usar Mongoose updateOne con $set
        // Esto crea dinámicamente el camino: "Lunes.bannerImageUrl"
        const updateField = `${day}.bannerImageUrl`; 

        const result = await Banner.updateOne(
            // Condición para encontrar el único documento de Banner
            {}, 
            { 
                $set: {
                    [updateField]: imageUrl, // Guarda la URL en el campo correcto
                }
            },
            // Opciones: upsert: true crea el documento si no existe
            { upsert: true }
        );

        // 4. Respuesta de éxito
        res.json({ 
            ok: true, 
            message: `URL de banner para ${day} guardada.`,
            bannerImageUrl: imageUrl, // Devolvemos la URL guardada
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
    const { category, vapeId, descuento } = req.body as IBannerDay;

    let banner = await Banner.findOne();
    if (!banner) banner = await Banner.create({});

    banner[day] = { category, vapeId, descuento };
    await banner.save();

    res.json({ ok: true, banner });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el día del banner" });
  }
};

