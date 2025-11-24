import { customAlphabet } from "nanoid";

export function generateOTP() {
  const nanoid = customAlphabet("0123456789xcfnvbn", 6);
  return nanoid();
}
