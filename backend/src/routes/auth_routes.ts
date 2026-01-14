import { Router } from "express";
import { Dropshipper } from "../models/Dropshipper";


const router = Router();

router.post("/register", async (req, res) => {
  try {
    const { nombre, apellido, cedula, email, password, ...rest } = req.body;

    // 1. Verificar si ya existe
    const existing = await Dropshipper.findOne({ $or: [{ email }, { cedula }] });
    if (existing) {
      return res.status(400).json({ message: "El correo o la cédula ya están registrados." });
    }

    // 2. Generar código de referido único (ej: juan-4567)
    const shortId = cedula.slice(-4);
    const referralCode = `${nombre.toLowerCase().replace(/\s/g, "")}-${shortId}`;

    // 3. Crear el registro
    // Nota: ¡Recuerda encriptar el password en producción!
    const newDropshipper = new Dropshipper({
      nombre,
      apellido,
      cedula,
      email,
      password, // Debería ir encriptado: await bcrypt.hash(password, 10)
      referralCode,
      ...rest
    });

    await newDropshipper.save();

    res.status(201).json({ 
      ok: true, 
      message: "Registro exitoso",
      referralCode: newDropshipper.referralCode 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

export default router;