import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import productsRouter from "./routes/products_routes";

const app = express();

// ✅ Permitir frontend local y desplegado
app.use(cors({
  origin: [
    "http://localhost:5173",        // desarrollo local
    "https://vapes-princys.vercel.app" // reemplázalo con tu dominio real
  ],
  credentials: true,
}));

app.use(morgan("dev"));
app.use(express.json());

// ✅ Servir imágenes (por ejemplo: /public/images/product1.jpg)
app.use(express.static(path.join(process.cwd(), "public")));

// ✅ Rutas principales
app.use("/api/products", productsRouter);

// ✅ Ruta de salud (para verificar despliegue)
app.get("/health", (_req, res) => res.json({ ok: true }));

app.get("/", (_req, res) => {
  res.send("Vapitos Princys API – usa /health o /api/products");
});


export default app;
