// controllers/admin.controller.ts
import User from "../models/user";
import { Request, Response } from "express";

export const getDropshippersList = async (req: Request, res: Response) => {
  try {
    // Buscamos usuarios con rol DROPSHIPPER (en mayúsculas como tu enum)
    const users = await User.find({ role: "DROPSHIPPER" })
      .select("nombre apellido email celular createdAt") // Traemos los campos de tu esquema
      .sort({ createdAt: -1 });

    // Mapeamos para enviar los datos limpios al frontend
    const formattedUsers = users.map(user => ({
      id: user._id,
      fullName: `${user.nombre} ${user.apellido}`, // Unimos nombre y apellido
      email: user.email,
      phone: user.celular || "No registrado", // Mapeamos 'celular' a 'phone'
      createdAt: user.createdAt
    }));

    res.json(formattedUsers);
  } catch (error) {
    console.error("Error al obtener dropshippers:", error);
    res.status(500).json({ error: "Error al obtener la lista de usuarios" });
  }
};