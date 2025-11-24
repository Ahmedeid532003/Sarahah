
import Message from "../../db/models/message.model.js";
import User from "../../db/models/user.model.js";
import { asyncHandler } from "./asyncHandler.util.js";

export const sendMessage = async (req, res) => {
  try {
    const { receiverId } = req.params;
    const { content, senderId } = req.body; 

    if (!senderId) {
      return res.status(400).json({ message: "senderId is required in request body" });
    }

    if (!content) {
      return res.status(400).json({ message: "content is required" });
    }

    const message = await Message.create({
      senderId,
      receiverId,
      content,
    });

    res.status(201).json({ message: "Message sent", data: message });
  } catch (error) {
    console.error("❌ Send message error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getMessages = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const messages = await Message.find({
    $or: [{ senderId: userId }, { receiverId: userId }],
  }).sort({ createdAt: -1 });

  res.status(200).json({ message: "Messages fetched", data: messages });
});

export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}, { password: 0 }); // استبعاد كلمة المرور
  res.status(200).json({ message: "Users fetched", data: users });
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId, { password: 0 });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.status(200).json({ message: "User fetched", data: user });
});
