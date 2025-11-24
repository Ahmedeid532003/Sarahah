const otpStore = new Map();

export function saveOTP(email, otp) {
  otpStore.set(email, { otp, expires: Date.now() + 5 * 60 * 1000 });
}

export function verifyOTP(email, enteredOTP) {
  const record = otpStore.get(email);
  if (!record) return false;
  if (Date.now() > record.expires) return false;
  return record.otp === enteredOTP;
}

export function deleteOTP(email) {
  otpStore.delete(email);
}
