import { Router } from "express";
import { body } from "express-validator";
import { listProducts, getProductById } from "../controllers/products_controller";
import { createAccount, login } from "../handlers";
import { handleInputErrrors } from "../middleware/validation";

const router = Router();

/* ===========================
   🔹 RUTAS DE PRODUCTOS
   =========================== */

// GET /api/products?q=nombre&category=nombre_categoria
router.get("/", listProducts);       // lista todos o filtra por nombre / categoría
router.get("/:id", getProductById);  // obtiene un producto por ID


/* ===========================
   🔹 AUTENTICACIÓN (REGISTER / LOGIN)
   =========================== */

router.post(
  "/auth/register",
  body("handle")
    .notEmpty()
    .withMessage("El handle no puede ir vacío."),
  body("name")
    .notEmpty()
    .withMessage("El name no puede ir vacío."),
  body("email")
    .isEmail()
    .withMessage("El email no es válido."),
  body("password")
    .notEmpty()
    .isLength({ min: 8 })
    .withMessage("El password es muy corto, mínimo ocho caracteres."),
  handleInputErrrors,
  createAccount
);

router.post(
  "/auth/login",
  body("email")
    .isEmail()
    .withMessage("El email no es válido."),
  body("password")
    .notEmpty()
    .withMessage("El password es obligatorio."),
  handleInputErrrors,
  login
);

export default router;
