import { User } from "./user.model.js";

export class UserRepository {
  async createUser(data) {
    return await User.create(data);
  }

  async findByEmail(email) {
    return await User.findOne({ email });
  }

  async findById(id) {
    return await User.findById(id);
  }

  async getAllUsers() {
    return await User.find();
  }
}
