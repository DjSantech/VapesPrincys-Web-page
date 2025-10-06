import type { Request, Response } from "express";
import User from "../models/user";
import { validationResult } from "express-validator";
import { checkPassword, hashPassword } from "../utils/auth";
import slug from "slug";
import { generateJWT } from "../utils/jwt";

export const createAccount = async (req: Request, res: Response) => {
  // Valida errores de express-validator si los usas en la ruta
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, handle: handleRaw } = req.body;

  // ¿ya existe el email?
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(409).json({ error: "Un usuario ya está registrado con ese email" });
  }

  // genera el handle limpio
  const handle = slug(handleRaw, {
    lower: true,
    locale: "es",
    trim: true,
    replacement: "-",
  });

  // ¿ya existe ese handle?
  const handleExists = await User.findOne({ handle });
  if (handleExists) {
    return res.status(409).json({ error: "Handle de usuario no disponible" });
  }

  // crea usuario
  const user = new User({
    ...req.body,
    handle,
    password: await hashPassword(password),
  });

  await user.save();

  return res.status(201).send("Registro creado correctamente");
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ error: "Este usuario no existe" });
  }

  const isPasswordCorrect = await checkPassword(password, user.password);
  if (!isPasswordCorrect) {
    return res.status(401).json({ error: "La contraseña ingresada es incorrecta" });
  }

  const token = generateJWT(user);
  return res.json({ token });
};
