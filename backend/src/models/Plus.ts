import { Schema, model } from "mongoose";

export interface IPlus {
  name: string;
}

const plusSchema = new Schema<IPlus>(
  {
    name: { type: String, required: true, unique: true, trim: true },
  },
  { timestamps: true }
);

export default model<IPlus>("Plus", plusSchema);
