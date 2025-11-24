// 📁 src/modules/auth/auth.routes.js
import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { requestEmailVerification, verifyEmailOTP, updateUser } from "./auth.controller.js";
import { verifyToken } from "../../../utile/Token/auth.middleware.js";
import { BlacklistedToken } from "./blacklist.model.js";
import { signUp, login } from "./auth.controller.js";
import{forgotPassword,resetPassword} from "./auth.controller.js";
import upload from "../../Middelware/multer.config.js";
import { uploadProfileImage } from "./auth.controller.js";
import { uploadCloud } from "../../Middelware/multer.cloud.js";
import { signUpWithImage } from "./auth.controller.js";
import { requireRole } from "./role.middleware.js";
import { getAllUsers } from "./auth.controller.js";
import { freezeAccount, unfreezeAccount } from "./auth.controller.js";




dotenv.config();
const router = express.Router();



router.post("/signup", signUp);
router.post("/signup", upload.single("profileImage"), signUp);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/upload-profile", upload.single("profileImage"), uploadProfileImage);
router.post("/signup", uploadCloud.single("profileImage"), signUpWithImage);
router.patch("/freeze/:userId", freezeAccount);
router.patch("/unfreeze/:userId", unfreezeAccount);
router.patch("/freeze/:id", async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isFrozen: true },
    { new: true }
  );
  res.json({ message: "Account Freezed Successfully", user });
});

router.patch("/unfreeze/:id", async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isFrozen: false },
    { new: true }
  );
  res.json({ message: "Account Unfreezed Successfully", user });
});

router.get("/all-users",
    verifyToken,
    requireRole("admin"),
    getAllUsers
);  
router.get("/all-users", verifyToken, requireRole("admin"), getAllUsers);
router.patch("/request-otp", requestEmailVerification);
router.patch("/verify-otp", verifyEmailOTP);
router.put("/update", verifyToken, updateUser);



export const verifyForgotOTP = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ message: "Email and OTP required" });

  const valid = verifyOTP(email, otp);
  if (!valid) return res.status(400).json({ message: "Invalid or expired OTP" });

  res.json({ message: "OTP verified successfully, you can now reset your password" });
};




router.post("/logout", verifyToken, async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET);

    if (!decoded?.userId || !decoded?.jti) {
      console.log("❌ Missing user data in token:", decoded);
      return res.status(400).json({ message: "Invalid token payload" });
    }

    const blacklisted = new BlacklistedToken({
      jti: decoded.jti,
      userId: decoded.userId,
      exp: decoded.exp,
      blacklistedAt: new Date(),
    });

    await blacklisted.save();

    return res.status(200).json({ message: "✅ User logged out successfully" });
  } catch (err) {
    console.error("❌ Logout error:", err);
    return res.status(500).json({
      message: "Server error during logout",
      error: err.message,
    });
  }
});

export default router;






