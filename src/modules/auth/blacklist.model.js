import mongoose from "mongoose";

const blacklistSchema = new mongoose.Schema({
  jti: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  exp: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const BlacklistedToken = mongoose.model("BlacklistedToken", blacklistSchema);
