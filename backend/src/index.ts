// src/index.ts7
import mongoose from "mongoose";
import app from "./app";

(async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      console.error("❌ MONGO_URI indefinida");
      process.exit(1);
    }
    await mongoose.connect(uri);
    console.log("✅ MongoDB conectado");

    const PORT = Number(process.env.PORT) || 10000;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 API running on port ${PORT}`);
    });
  } catch (e) {
    console.error("❌ Error iniciando API:", e);
    process.exit(1);
  }
})();

const PORT = Number(process.env.PORT) || 10000;
const HOST = "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`🚀 API running on http://${HOST}:${PORT}`);
});
