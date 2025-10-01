import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import productsRouter from "./routes/products_routes";

const app = express();

app.use(cors({ origin: ["http://localhost:5173"] }));
app.use(morgan("dev"));
app.use(express.json());

// sirve la carpeta public para imágenes
app.use(express.static(path.join(process.cwd(), "public")));

app.use("/api/products", productsRouter);

app.get("/health", (_req, res) => res.json({ ok: true }));


export default app;
