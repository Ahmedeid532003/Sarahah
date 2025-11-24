import { User } from "../../src/modules/auth/auth.model.js";

export const checkFreeze = async (req, res, next) => {
  const userId = req.user.userId;

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (user.isFrozen) {
    return res.status(403).json({ message: "Your account is frozen. Contact support." });
  }

  next();
};
