// src/scripts/keepAlive.ts
import cron from "node-cron";
import mongoose from "mongoose";

/** Envía un ping cada 10 min si hay conexión activa a Mongo */
export function startMongoKeepAlive() {
  cron.schedule("*/10 * * * *", async () => {
    try {
      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.db.admin().ping();
        console.log("[keepAlive] Ping OK", new Date().toISOString());
      } else {
        console.warn("[keepAlive] Sin conexión activa (saltando ping)");
      }
    } catch (err: any) {
      console.error("[keepAlive] Error en ping:", err?.message ?? err);
    }
  }, { timezone: "America/Bogota" });
}
