import "dotenv/config";               // <-- carga .env ANTES de usarlo
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db";
import productRouter from "./routes/products_routes";

console.log("URI:", process.env.MONGODB_URI?.slice(0,30)+"...");



const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/products", productRouter);

const PORT = process.env.PORT ?? 8080;
// en index.ts, después de app.use(express.json())
app.use((req, _res, next) => { console.log("[REQ]", req.method, req.path); next(); });

app.get("/health", (_req, res) => res.send("ok"));

// Arranque SECUENCIAL: primero BD, luego servidor
(async () => {
  try {
    await connectDB();                     // <-- espera conexión
    app.listen(PORT, () =>
      console.log(`🚀 API running on http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error("❌ No se pudo conectar a Mongo:", err);
    process.exit(1);                        // falla rápido si no hay BD
  }
})();

