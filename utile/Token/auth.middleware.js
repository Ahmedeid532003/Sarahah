import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Token from "../../src/db/models/token.model.js"; 


dotenv.config();

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = decoded; 
    next();
    const storedToken = await Token.findOne({ jti: decoded.jti, userId: decoded.userId });

    if (!storedToken) {
      return res.status(401).json({ message: "Token not found in DB" });
    }
    if (storedToken.blacklisted) {
      return res.status(401).json({ message: "Token is blacklisted" });
    }

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      jti: decoded.jti,
    };

    next();
  } catch (error) {
    console.error("❌ Auth middleware error:", error.message);
    return res.status(401).json({ message: "Invalid token", error: error.message });
  }
};

export const verifyRefreshTokenMiddleware = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token required" });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET
    );
    const storedToken = await Token.findOne({
      token: refreshToken,
      userId: decoded.userId,
    });

    if (!storedToken) {
      return res.status(401).json({ message: "Refresh token not found or revoked" });
    }

    if (storedToken.expiresAt < new Date()) {
      await Token.deleteOne({ token: refreshToken });
      return res.status(401).json({ message: "Refresh token expired" });
    }
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    next();
  } catch (error) {
    console.error("❌ Refresh token verification failed:", error.message);
    return res.status(401).json({ message: "Invalid refresh token" });
  }
};
