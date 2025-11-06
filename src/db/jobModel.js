import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  command: { type: String, required: true },
  state: {
    type: String,
    enum: ["pending", "processing", "completed", "failed", "dead"],
    default: "pending",
  },
  attempts: { type: Number, default: 0 },
  max_retries: { type: Number, default: 3 },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

jobSchema.pre("save", function (next) {
  this.updated_at = new Date();
  next();
});

export const Job = mongoose.model("Job", jobSchema);
