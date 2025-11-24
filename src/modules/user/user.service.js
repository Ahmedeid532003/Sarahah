import bcrypt from "bcrypt";
import { UserRepository } from "./user.repository.js";
import { asymmetricEncrypt, asymmetricDecrypt } from "../../../utile/encrption/encrption.utile.js";

export const createUser = async (email, password) => {
  const encryptedEmail = asymmetricEncrypt(email);
  const encryptedPassword = asymmetricEncrypt(password);

  console.log("✅ Encrypted Email:", encryptedEmail);
  console.log("✅ Encrypted Password:", encryptedPassword);

  return { email: encryptedEmail, password: encryptedPassword };
};

export const getUserData = async (userRecord) => {
  const decryptedEmail = asymmetricDecrypt(userRecord.email);
  const decryptedPassword = asymmetricDecrypt(userRecord.password);

  return { email: decryptedEmail, password: decryptedPassword };
};


const userRepo = new UserRepository();

export class UserService {
  async registerUser(data) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return await userRepo.createUser({ ...data, password: hashedPassword });
  }

  async getAllUsers() {
    return await userRepo.getAllUsers();
  }
}
