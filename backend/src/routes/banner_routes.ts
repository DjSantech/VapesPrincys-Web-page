import { Router } from "express";
import multer from "multer";
import { updateBannerDayImage, updateBanner,getBanner } from "../controllers/bannerController";

const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

// Obtener banner completo
router.get("/", getBanner);

// Guardar configuración (sin imagen)
router.post("/", updateBanner);

// Subir imagen de un día específico
router.patch("/:day/image", upload.single("image"), updateBannerDayImage);

export default router;
