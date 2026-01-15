import { Router } from "express";
import { Dropshipper } from "../models/Dropshipper";
import jwt from "jsonwebtoken";

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

// --- LOGIN ---
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Buscar al usuario
    const user = await Dropshipper.findOne({
      $or: [
        { email: email.toLowerCase() },
        { cedula: email } 
      ]
    });
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // 2. Verificar contraseña 
    if (user.password !== password) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    // 3. GENERAR TOKEN REAL 🔥
    // Guardamos el ID y el ROL dentro del token
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET || "clave_secreta_provisional_123", 
      { expiresIn: "7d" } // El token dura 7 días
    );

    // 4. Responder con el TOKEN REAL
    res.json({
      ok: true,
      token, // <--- Aquí va el JWT real (un string largo)
      user: {
        id: user._id,
        nombre: user.nombre,
        rol: user.role, 
        referralCode: user.referralCode
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});
export default router;