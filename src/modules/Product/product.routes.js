import express from "express";
import { createProduct } from "./product.controller.js";
import { verifyToken } from  "../../../utile/Token/auth.middleware.js";
import { requireRole } from "../auth/role.middleware.js";

const router = express.Router();

router.post("/create-product", verifyToken, requireRole("admin", "manager"), createProduct);

export default router;
