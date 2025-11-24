
import express from "express";
import {
  sendMessage,
  getMessages,
  getAllUsers,
  getUserById,
} from "./message.controller.js";

const router = express.Router();


router.post("/send/:receiverId", sendMessage);
router.get("/all/:userId", getMessages);
router.get("/users", getAllUsers);
router.get("/user/:userId", getUserById);

export default router;
