import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  token: { type: String, required: true },
  jti: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  type: { type: String, enum: ["refresh"], default: "refresh" },
});

export default mongoose.model("Token", tokenSchema);
