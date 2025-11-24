import express from "express";
import dotenv from "dotenv";
import connectDB from "./src/db/connection.js";
import authRouter from "./src/modules/auth/auth.routes.js";
import authRouterV2 from "./src/modules/auth/auth.routes.js";
import { verifyToken } from "./utile/Token/auth.middleware.js";
import { generateToken } from "./utile/Token/token.utile.js";
import { sendOTPEmail } from "./utile/Email/email.utile.js";
import messageRouter from "./src/modules/message/message.routes.js";
import path from "path";
import { fileURLToPath } from "url";
import productRoutes from "./src/modules/Product/product.routes.js";
import morgan from "morgan";
import fs from "fs";
import cors from "cors";
import { corsOptions } from "./src/config/cors.js";
import chalk from "chalk";




dotenv.config();
await connectDB();

const app = express();
app.use(express.json());
app.use(cors(corsOptions));
app.use(morgan("dev"));


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);

app.use(morgan("combined", { stream: accessLogStream }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/auth", authRouterV2);
app.use("/api/v1/message", messageRouter);
app.use("/api/v1/products", productRoutes);
app.get("/", (req, res) => {
  res.json({ message: "CORS whitelist is working!" });
});

app.get("/api/v1/protected", verifyToken, (req, res) => {
  res.json({ message: "You have access", user: req.user });
});

sendOTPEmail("aaid22510@gmail.com");
const token = generateToken({ userId: "123456789012345678901234", email: "test@example.com" });
console.log("🔑 Token:", token);

const port = 3000;
app.listen(port, () =>{ console.log(chalk. bgGreen(chalk.black(`Server running on http://localhost:${port}`))
);
});
