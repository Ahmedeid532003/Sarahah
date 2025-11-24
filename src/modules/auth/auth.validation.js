import Joi from "joi";

export const signUpSchema = Joi.object({
  userName: Joi.string().min(3).max(20).required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)
    .message("Password must be at least 8 characters long, include uppercase, lowercase, and a number")
    .required(),
  age: Joi.number().min(10).max(100).required(),
  firstName: Joi.string().min(2).max(30).required(),
  lastName: Joi.string().min(2).max(30).required(),
  gender: Joi.string().valid("male", "female", "other").required()
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});
