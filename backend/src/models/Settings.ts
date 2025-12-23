import { Schema, model } from "mongoose";

const settingsSchema = new Schema({
  key: { type: String, required: true, unique: true, default: "global_config" },
  announcementImageUrl: { type: String, default: "" },
  announcementIsActive: { type: Boolean, default: false }
}, { timestamps: true });

export default model("Settings", settingsSchema);