import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export function requireAuth(req: Request, res: Response, next: NextFunction){
  const token = req.headers.authorization?.replace("Bearer ","");
  if(!token) return res.status(401).json({error:"No token"});
  try{
    (req as any).user = jwt.verify(token, process.env.JWT_SECRET!);
    next();
  }catch{ return res.status(401).json({error:"Token inválido"}); }
}

export function requireRole(role: "admin"){
  return (req: any, res: any, next: any) =>
    req.user?.role === role ? next() : res.status(403).json({error:"Forbidden"});
}
