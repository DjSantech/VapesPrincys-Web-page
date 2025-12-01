import { Router } from "express";
import multer from "multer";

import { getBanner, updateBanner, updateBannerDay,updateBannerDayImage } from "../controllers/bannerController";
const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

router.get("/", getBanner);
router.post("/", updateBanner);
router.patch("/:day", updateBannerDay);
router.patch("/:day/image", upload.single("image"), updateBannerDayImage);

export default router;
