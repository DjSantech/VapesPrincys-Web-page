import { Request, Response } from "express";
import { Banner, IBanner, IBannerDay,BannerDays } from "../models/Banner";
import { uploadBufferToCloudinary } from "../lib/uploadBufferToCloudinary"; 
import { deleteImageFromCloudinary } from "../lib/cloudinary";

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
        // 1.5 Lógica de limpieza: Borrar imagen vieja de la nube si existe
      if (bannerDoc && bannerDoc[day]?.bannerImageUrl) {
          await deleteImageFromCloudinary(bannerDoc[day]!.bannerImageUrl!);
      }
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
// POST /api/banner  → Guardar TODO el banner
export const updateBanner = async (req: Request, res: Response) => {
  try {
    const data = req.body as Partial<IBanner>;

    let banner = await Banner.findOne();
    if (!banner) {
      banner = await Banner.create(data);
    } else {
      const keys = Object.keys(data) as (keyof IBanner)[];

      for (const dayKey of keys) {
        const dayData = data[dayKey];

        // 1. Borrado y asignación de null
        if (!dayData) {
          if (banner[dayKey]?.bannerImageUrl) {
            await deleteImageFromCloudinary(banner[dayKey]!.bannerImageUrl!);
          }
          // Usamos Record<string, any> para que TS permita la asignación de null sin quejarse
          (banner as Record<string, any>)[dayKey] = null;
          continue;
        }

        // 2. Mantener imagen y actualizar datos
        const previousUrl = banner[dayKey]?.bannerImageUrl || null;

        // Construimos el objeto nuevo
        const updatedDayContent = {
          ...((banner[dayKey] as any) || {}), // Evitamos spread de null
          ...dayData,
          bannerImageUrl: previousUrl,
        };

        // Asignamos usando el Record para saltar la validación estricta de Mongoose
        (banner as Record<string, any>)[dayKey] = updatedDayContent;
      }

      // Obligamos a Mongoose a notar los cambios en campos mixtos/anidados
      banner.markModified('Lunes');
      banner.markModified('Martes');
      banner.markModified('Miercoles');
      banner.markModified('Jueves');
      banner.markModified('Viernes');
      banner.markModified('Sabado');
      banner.markModified('Domingo');

      await banner.save();
    }

    res.json({ ok: true, banner });
  } catch (error) {
    console.error("Error en updateBanner:", error);
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


