import { Router } from "express";
import { listProducts, getProductById } from "../controllers/products.controller";

const router = Router();

router.get("/", listProducts);       // GET /api/products
router.get("/:id", getProductById);  // GET /api/products/:id

export default router;
