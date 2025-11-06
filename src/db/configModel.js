import mongoose from "mongoose";

const configSchema = new mongoose.Schema({
  key: { type: String, unique: true, required: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
});

export const Config = mongoose.model("Config", configSchema);
