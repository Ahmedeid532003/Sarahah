import { Product } from "./product.model.js";

export const createProduct = async (req, res) => {
  try {
    const newProduct = await Product.create(req.body);
    res.status(201).json({ message: "Product created", newProduct });
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};
