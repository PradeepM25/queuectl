import mongoose from "mongoose";

const dlqJobSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  command: { type: String, required: true },
  attempts: { type: Number, required: true },
  failed_at: { type: Date, default: Date.now },
  reason: { type: String, default: "Max retries exhausted" },
});

export const DLQJob = mongoose.model("DLQJob", dlqJobSchema);
