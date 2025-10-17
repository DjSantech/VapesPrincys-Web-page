// src/models/User.ts
import { Schema, model } from "mongoose";

const userSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["admin","user"], default: "user", index: true }
}, { timestamps: true });

export default model("User", userSchema);
