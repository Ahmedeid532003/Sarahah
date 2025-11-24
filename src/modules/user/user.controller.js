import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.util.js";
import { UserService } from "./user.service.js";

const userService = new UserService();

export const register = asyncHandler(async (req, res) => {
  const user = await userService.registerUser(req.body);
  res.status(201).json({ message: "User registered successfully", user });
});

export const getUsers = asyncHandler(async (req, res) => {
  const users = await userService.getAllUsers();
  res.status(200).json({ message: "All users", users });
});

const router= Router();


router.get("/" ,(req,res)=>{
    return res.status(200).json({message:"hello "});

});
export default router;
