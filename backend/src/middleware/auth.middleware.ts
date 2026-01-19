const jwt = require("jsonwebtoken");
const User = require("../models/User");

// 1. Verifica que el usuario envió un token válido
export const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Extrae el token del Bearer

    if (!token) {
      return res.status(403).json({ message: "No se proporcionó un token de acceso" });
    }

    // Decodifica el token (asegúrate de que JWT_SECRET sea el mismo que usas al hacer login)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "tu_clave_secreta");
    req.userId = decoded.id; // Guardamos el ID del usuario en la petición

    next();
  } catch (error) {
    return res.status(401).json({ message: "Token no válido o expirado" });
  }
};

// 2. Verifica que el usuario sea Administrador
export const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (user.role !== "ADMIN") {
      return res.status(403).json({ message: "Requiere privilegios de administrador" });
    }

    next(); // Si es admin, continúa a la ruta
  } catch (error) {
    return res.status(500).json({ message: "Error al validar rol" });
  }
};