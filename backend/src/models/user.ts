import { Model, Schema, model, models } from "mongoose";

const userSchema = new Schema({
  // Campos básicos de acceso
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  password: { type: String, required: true }, // Cambiado de passwordHash para coincidir con tu lógica actual
  role: { 
    type: String, 
    enum: ["ADMIN", "DROPSHIPPER"], // Usamos mayúsculas para ser consistentes con el Frontend
    default: "DROPSHIPPER", 
    index: true 
  },

  // Campos de perfil del Dropshipper (Solo se llenan si el rol es DROPSHIPPER)
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  cedula: { type: String, unique: true, sparse: true }, // 'sparse' permite que el Admin no tenga cédula
  celular: { type: String },
  fechaNacimiento: { type: Date },
  direccion: { type: String },
  
  // Campo clave para el link de ventas
  referralCode: { type: String, unique: true, sparse: true },
  
  isActive: { type: Boolean, default: true }
}, { timestamps: true ,
    collection: 'dropshippers'
});


const User = (models.User as Model<any>) || model("User", userSchema);

export default User;