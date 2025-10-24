import { Router } from "express";
import Plus from "../models/Plus";

const r = Router();

/** =========================
 *  GET /api/pluses
 *  Devuelve todos los pluses
 *  ========================= */
r.get("/", async (_req, res) => {
  try {
    const all = await Plus.find().sort({ createdAt: -1 }).lean();
    res.json(all.map(p => ({ id: String(p._id), name: p.name })));
  } catch (e) {
    console.error("GET /pluses error:", e);
    res.status(500).json({ error: "Error interno listando pluses" });
  }
});

/** =========================
 *  POST /api/pluses
 *  Crea un nuevo plus
 *  ========================= */
r.post("/", async (req, res) => {
  try {
    const name = String(req.body?.name ?? "").trim();
    if (!name) return res.status(400).json({ error: "El campo 'name' es obligatorio." });

    const created = await Plus.create({ name });
    res.status(201).json({ id: String(created._id), name: created.name });
  } catch (e: any) {
    console.error("POST /pluses error:", e?.message || e);
    if (e?.code === 11000) {
      return res.status(409).json({ error: "El plus ya existe" });
    }
    res.status(500).json({ error: "Error interno creando plus" });
  }
});

/** =========================
 *  DELETE /api/pluses/:id
 *  Elimina un plus por ID
 *  ========================= */
r.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Plus.findByIdAndDelete(id);
    res.status(204).end();
  } catch (e) {
    console.error("DELETE /pluses/:id error:", e);
    res.status(500).json({ error: "Error interno eliminando plus" });
  }
});

export default r;
