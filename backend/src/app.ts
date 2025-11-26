// src/app.ts
import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";

import productsRouter from "./routes/products_routes";
import plusesRouter from "./routes/pluses_routes";
import bannerRoutes from "./routes/banner_routes";
import CategoriesRouter from "./routes/categories_routes";

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://vapesprincys-web-page.onrender.com",
    "https://vapes-princys-web-page.vercel.app",
    "https://vapes-princys-web-page.vercel.app",
  ],
  credentials: false,
}));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.static(path.join(process.cwd(), "public")));

app.use("/api/products", productsRouter);
app.use("/api/categories", CategoriesRouter);
app.use("/api/pluses", plusesRouter);
app.use("/api/banner", bannerRoutes);
console.log("Pluses router mounted at /api/pluses");

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.get("/", (_req, res) => {
  res.send("Vapitos Princys API – usa /api/health o /api/products");
});

export default app;
