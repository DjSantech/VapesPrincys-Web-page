// src/server.ts
import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";

import productsRouter from "./routes/products_routes";
import plusesRouter from "./routes/pluses_routes"; // ✅ IMPORT ARRIBA

const app = express();

// ✅ CORS: incluye tu dominio real del front en producción
app.use(cors({
  origin: [
    "http://localhost:5173",                          // dev local
    "https://vapesprincys-web-page.onrender.com",     // tu front en Render
    "https://vapes-princys.vercel.app",               // (si también usas Vercel)
  ],
  credentials: false, // no usas cookies; si las usas, pon true
}));

app.use(morgan("dev"));
app.use(express.json());

// ✅ Archivos estáticos públicos (si los usas)
app.use(express.static(path.join(process.cwd(), "public")));

// ✅ Monta APIs ANTES de cualquier catch-all del front
app.use("/api/products", productsRouter);
app.use("/api/pluses", plusesRouter); // ✅ AHORA SÍ SE MONTA
console.log("Pluses router mounted at /api/pluses");
// ✅ Healthcheck (útil para probar despliegue)
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// (Opcional) Si sirves el build del front desde el mismo servidor,
// agrega el estático del front y un catch-all DESPUÉS de las APIs.
// import path from "path";
// app.use(express.static(path.join(process.cwd(), "dist")));
// app.get("*", (_req, res) => {
//   res.sendFile(path.join(process.cwd(), "dist", "index.html"));
// });

app.get("/", (_req, res) => {
  res.send("Vapitos Princys API – usa /api/health o /api/products");
});

export default app;
