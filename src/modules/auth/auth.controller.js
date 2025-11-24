import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../../db/models/user.model.js";
import { signUpSchema, loginSchema } from "./auth.validation.js";
import { sendOTPEmail } from "../../../utile/Email/email.utile.js";
import { saveOTP, verifyOTP, deleteOTP } from "../../../utile/Otp/otp.store.js";

// =================== SIGNUP ===================
export const signUp = async (req, res) => {
  try {
    const { error } = signUpSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        message: "Validation error",
        details: error.details.map((err) => err.message),
      });
    }

    const { userName, email, password, age, firstName, lastName, gender } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
   let profileImage = null;
    if (req.file) {
      profileImage = `/uploads/users/${req.file.filename}`;
    }
    const newUser = await User.create({
      userName,
      email,
      password: hashedPassword,
      age,
      firstName,
      lastName,
      gender,
      profileImage, 
    role: "user",   

    });

    res.status(201).json({
      message: "User registered successfully",
      data: {
        id: newUser._id,
        userName: newUser.userName,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        gender: newUser.gender,
        age: newUser.age,
      },
    });
  } catch (error) {
    console.error("❌ Signup error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// =================== LOGIN ===================
export const login = async (req, res) => {
  try {
    const { error } = loginSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        message: "Validation error",
        details: error.details.map((err) => err.message),
      });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
  if (user.isFrozen) {
    return res.status(403).json({ message: "Account is frozen" });
  }


    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({
      message: "Login successful",
      token,
      data: { id: user._id, userName: user.userName, email: user.email,role:user.role, },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// =================== UPDATE USER ===================
export const updateUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { firstName, lastName, age, gender } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, age, gender },
      { new: true }
    );

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// =================== OTP ===================
export const requestEmailVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    await sendOTPEmail(email);
    res.json({ message: "OTP sent successfully to your email" });
  } catch (err) {
    res.status(500).json({ message: "Failed to send OTP", error: err.message });
  }
};

// =================== VERIFY EMAIL OTP ===================
export const verifyEmailOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ message: "Email and OTP required" });

    const isValid = verifyOTP(email, otp);
    if (!isValid) return res.status(400).json({ message: "Invalid or expired OTP" });

    deleteOTP(email);

    res.json({ message: "Email verified successfully" });
  } catch (err) {
    console.error("❌ Verify OTP Error:", err);
    res.status(500).json({ message: "Verification failed", error: err.message });
  }
};

// =================== FORGOT PASSWORD ===================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    saveOTP(email, otp);
    await sendOTPEmail(email, otp);

    res.json({ message: "OTP sent successfully to your email" });
  } catch (err) {
    console.error("❌ Forgot Password Error:", err);
    res.status(500).json({ message: "Failed to send OTP", error: err.message });
  }
};

// =================== RESET PASSWORD ===================
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword)
      return res.status(400).json({ message: "Email, OTP, and new password are required" });

    const isValid = verifyOTP(email, otp);
    if (!isValid) return res.status(400).json({ message: "Invalid or expired OTP" });

    deleteOTP(email);

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.findOneAndUpdate({ email }, { password: hashedPassword });

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    console.error("❌ Reset Password Error:", err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};


export const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const filePath = `/uploads/${req.file.filename}`;

    return res.status(200).json({
      message: "File uploaded successfully",
      file: filePath,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ message: "Upload failed", error: err.message });
  }
};
export const signUpWithImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Profile image is required" });
    }

    const { userName, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      ...req.body,
      password: hashedPassword,
      profileImage: req.file.path, 
    });

    res.status(201).json({
      message: "User registered successfully",
      data: newUser,
    });
  } catch (err) {
    console.error("❌ Signup error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
export const signup = async (req, res) => {
  try {
    console.log(req.file); 
    const imageURL = req.file?.path; 
    return res.json({
      message: "User created",
      image: imageURL
    });

  } catch (error) {
    return res.status(500).json({ message: "Error", error: error.message });
  }
};


export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ users });
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};

export const freezeAccount = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndUpdate(
      userId,
      { isFrozen: true },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({
      message: "Account Freezed Successfully",
      user
    });
  } catch (err) {
    return res.status(500).json({ message: "Server Error" });
  }
};

export const unfreezeAccount = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndUpdate(
      userId,
      { isFrozen: false },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({
      message: "Account Unfreezed Successfully",
      user
    });
  } catch (err) {
    return res.status(500).json({ message: "Server Error" });
  }
};
export const signIn = async (req, res) => {
  const { email, password } = req.body;

  const exist = await User.findOne({ email });
  if (!exist) return res.status(404).json({ message: "User not found" });

  if (exist.isFrozen)
    return res.status(403).json({ message: "Account is frozen" });

  const match = await bcrypt.compare(password, exist.password);
  if (!match) return res.status(400).json({ message: "Wrong password" });

  const token = jwt.sign(
    { id: exist._id, role: exist.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return res.json({ message: "Login success", token });
};

