import cors from "cors";

const allowedOrigins = [
  "http://localhost:5173",        // desarrollo local
  "https://vapes-princys-web-page.vercel.app" // dominio de tu frontend en producción
];

export const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("No permitido por CORS"));
    }
  },
  credentials: true,
};

export default cors(corsOptions);
