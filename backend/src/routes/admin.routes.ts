// routes/admin.routes.ts
import { Router } from "express";
import { getDropshippersList } from "../controllers/admin.controller";
import { verifyToken, isAdmin } from "../middleware/auth.middleware";

const router = Router();

// Endpoint: GET /api/admin/dropshippers
router.get("/dropshippers", [verifyToken, isAdmin], getDropshippersList);

export default router;