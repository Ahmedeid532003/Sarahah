import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import crypto from "crypto";
import Token from "../../src/db/models/token.model.js";

dotenv.config();


export const generateToken = async (payload) => {
  if (!payload.userId) throw new Error("❌ Missing userId in token payload");

  const accessJti = crypto.randomUUID();
  const refreshJti = crypto.randomUUID();
  const accessExpiresIn = process.env.ACCESS_TOKEN_EXPIRES || "15m";
  const refreshExpiresIn = process.env.REFRESH_TOKEN_EXPIRES || "7d";
  const accessToken = jwt.sign(
    { ...payload, jti: accessJti },
    process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET,
    { expiresIn: accessExpiresIn }
  );

  const refreshToken = jwt.sign(
    { ...payload, jti: refreshJti },
    process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET,
    { expiresIn: refreshExpiresIn }
  );

  const accessDecoded = jwt.decode(accessToken);
  const refreshDecoded = jwt.decode(refreshToken);
  const accessExpiresAt = new Date(accessDecoded.exp * 1000);
  const refreshExpiresAt = new Date(refreshDecoded.exp * 1000);

  await Token.create({
    userId: payload.userId,
    token: refreshToken,
    jti: refreshJti,
    expiresAt: refreshExpiresAt,
    type: "refresh",
  });

  return {
    accessToken,
    refreshToken,
  };
};


export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET);
  } catch (error) {
    console.error("❌ Invalid Access Token:", error.message);
    return null;
  }
};

export const verifyRefreshToken = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET);

    const stored = await Token.findOne({ token, userId: decoded.userId });
    if (!stored) throw new Error("Refresh token not found or revoked");

    if (stored.expiresAt < new Date()) {
      await Token.deleteOne({ token });
      throw new Error("Refresh token expired");
    }

    return decoded;
  } catch (error) {
    console.error("❌ Invalid Refresh Token:", error.message);
    return null;
  }
};

export const deleteRefreshToken = async (token) => {
  await Token.deleteOne({ token });
};
