// backend/src/middlewares/auth_middleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const verifyToken = (req: any, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(403).json({ message: "No se proporcionó un token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "tu_clave_secreta") as any;
    
    // Guardamos TODO lo que viene en el JWT en el objeto request
    req.userId = decoded.id;
    req.userRole = decoded.role; // <--- AQUÍ GUARDAMOS EL ROL DEL JWT

    next();
  } catch (error) {
    return res.status(401).json({ message: "Token no válido o expirado" });
  }
};

export const isAdmin = (req: any, res: Response, next: NextFunction) => {
  // En lugar de ir a la base de datos, revisamos lo que pusimos en verifyToken
  if (req.userRole === "ADMIN") {
    next(); // Es admin, puede pasar
  } else {
    return res.status(403).json({ message: "No tienes permisos de administrador" });
  }
};