import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db";
import productRouter from "./routes/products_routes";
import categoriesRouter from "./routes/categories_routes";
import { startMongoKeepAlive } from "./scripts/KeepAlive";
 import categoryRouter from "./routes/categories_routes";

console.log("URI:", process.env.MONGODB_URI?.slice(0, 30) + "...");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/products", productRouter);
app.use("/api/categories", categoriesRouter);

const PORT = process.env.PORT ?? 8080;

app.use((req, _res, next) => { console.log("[REQ]", req.method, req.path); next(); });
app.get("/health", (_req, res) => res.send("ok"));

app.use("/api/categories", categoryRouter);
(async () => {
  try {
    await connectDB(); // <-- espera conexión
    startMongoKeepAlive(); // <--- INICIA EL PING PERIÓDICO AQUÍ

    app.listen(PORT, () => console.log(`🚀 API running on http://localhost:${PORT}`));
  } catch (err) {
    console.error("❌ No se pudo conectar a Mongo:", err);
    process.exit(1);
  }
})();
