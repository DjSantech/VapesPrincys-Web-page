import { Router } from "express";
import multer from "multer";
import Settings from "../models/Settings";
import { uploadBufferToCloudinary } from "../lib/uploadBufferToCloudinary";

const router = Router();

// Configuramos multer para mantener la imagen en memoria temporalmente
const storage = multer.memoryStorage();
const upload = multer({ storage });

/**
 * RUTA PARA SUBIR LA IMAGEN
 * Se encarga de recibir el archivo y usar tu función de utilidad
 */
router.post(
  "/upload-image", 
  
  upload.single("image"), // 'image' es el nombre que pusimos en el FormData del frontend
  async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No se proporcionó ninguna imagen" });
      }

      // Usamos tu función de utilidad
      // Guardamos en una carpeta llamada 'announcements'
      const result = await uploadBufferToCloudinary(req.file.buffer, "announcements");

      // Devolvemos la URL segura de Cloudinary
      res.json({ imageUrl: result.secure_url });
    } catch (error) {
      console.error("Error subiendo a Cloudinary:", error);
      res.status(500).json({ message: "Error al procesar la imagen" });
    }
  }
);

/**
 * LAS OTRAS RUTAS (GET y PUT) se mantienen igual
 */
router.get("/announcement", async (req, res) => {
  try {
    const settings = await Settings.findOne({ key: "global_config" });
    res.json(settings || { announcementImageUrl: "", announcementIsActive: false });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener" });
  }
});

router.put("/announcement", async (req, res) => {
  const { imageUrl, isActive } = req.body;
  try {
    const updated = await Settings.findOneAndUpdate(
      { key: "global_config" },
      { announcementImageUrl: imageUrl, announcementIsActive: isActive },
      { upsert: true, new: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error al guardar" });
  }
});

export default router;