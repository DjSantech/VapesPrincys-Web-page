import User from "../models/user"; 
import { Request, Response } from "express";

export const getDropshippersList = async (req: Request, res: Response) => {
  try {
    // 1. Forzamos a 'any' para evitar el error "This expression is not callable"
    const userModel = User as any; 

    // 2. Ejecutamos la consulta usando el modelo casteado
    const users = await userModel.find({ role: "DROPSHIPPER" })
      .select("nombre apellido email celular createdAt")
      .lean();

    // 3. Mapeamos igual que antes
    const formattedUsers = users.map((user: any) => ({
      id: user._id,
      fullName: `${user.nombre} ${user.apellido}`,
      email: user.email,
      phone: user.celular || "No registrado",
      createdAt: user.createdAt
    }));

    res.json(formattedUsers);
  } catch (error) {
    console.error("Error al obtener dropshippers:", error);
    res.status(500).json({ error: "Error al obtener la lista de usuarios" });
  }
};