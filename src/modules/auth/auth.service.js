import bcrypt from "bcryptjs";
import User from "../../db/models/user.model.js";
import { encrypt, decrypt } from "../../../utile/encrption/encrption.utile.js";
import { generateToken } from "../../../utile/Token/token.utile.js";

export const signup = async (userData) => {
  const { firstName, lastName, email, password, age, gender } = userData;

  const existingUser = await User.findOne({ email: encrypt(email) });
  if (existingUser) {
    return { success: false, status: 409, message: "Email already exists" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const encryptedEmail = encrypt(email);

  const user = await User.create({
    firstName,
    lastName,
    email: encryptedEmail,
    password: hashedPassword,
    age,
    gender,
  });

  return {
    success: true,
    status: 201,
    message: "User registered successfully",
    data: user,
  };
};

export const login = async ({ email, password }) => {
  try {
    const users = await User.find();
    const user = users.find((u) => decrypt(u.email) === email);

    if (!user) {
      console.log("❌ User not found for email:", email);
      return { status: 404, message: "User not found" };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("❌ Invalid password for user:", email);
      return { status: 401, message: "Invalid credentials" };
    }

    const token = await generateToken({
      userId: user._id,
      email: email, 
    });

    console.log("✅ Token generated:", token);

    return {
      status: 200,
      message: "Login successful",
      token,
    };
  } catch (error) {
    console.error("❌ Login error:", error);
    return {
      status: 500,
      message: "Server error during login",
      error: error.message,
    };
  }
};
