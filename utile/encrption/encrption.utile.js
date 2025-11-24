import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16;
const ENCRYPTION_SECRET_KEY = crypto
  .createHash("sha256")
  .update(process.env.ENCRYPTION_SECRET_KEY || "my-super-secret-key")
  .digest()
  .subarray(0, 32);

export const encrypt = (plaintext) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_SECRET_KEY, iv);

  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");

  return `${iv.toString("hex")}:${encrypted}`;
};

export const decrypt = (data) => {
  const [ivHex, encryptedText] = data.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_SECRET_KEY, iv);

  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
};
