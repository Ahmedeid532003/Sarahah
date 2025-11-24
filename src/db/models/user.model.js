import mongoose from "mongoose";

export const GENDER = {
  MALE: "male",
  FEMALE: "female",
};




export const ROLES = Object.freeze({
  USER: "USER",
  ADMIN: "ADMIN",
});

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minlength: [2, "First name must be at least 2 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      minlength: [2, "Last name must be at least 2 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    age: {
      type: Number,
      default: 18,
    },
    gender: {
      type: String,
      enum: Object.values(GENDER),
      required: [true, "Gender is required"],
    },

        isFrozen: {
      type: Boolean,
      default: false,
    },
 role: {
    type: String,
    enum: ["user", "admin", "manager"],
    default: "user",
    },
    emailConfirmed: {
      type: Boolean,
      default: false, 
    },
  },
  {
    timestamps: true,
  
  },
  {
      profileImage: { type: String } 

  },
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
