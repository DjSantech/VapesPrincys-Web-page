import { Router } from "express";
import { getBanner, updateBanner, updateBannerDay } from "../controllers/bannerController";

const router = Router();

router.get("/", getBanner);
router.post("/", updateBanner);
router.patch("/:day", updateBannerDay);

export default router;
