import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { generateOTP } from "../Otp/otp.utile.js"; 

dotenv.config();

export async function sendOTPEmail(to) {
  const otp = generateOTP();
  console.log("✅ Generated OTP:", otp);
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465, 
    secure: true,
  auth: {
  user: process.env.EMAIL_USER,
  pass: process.env.EMAIL_PASS,
},
      tls: {
    rejectUnauthorized: false, 
  },
  
  });

  const mailOptions = {
    from: `"Saraha App" <${process.env.EMAIL_USER}>`,
    to:"ahmedeid200353@gmail.com",
    subject: "Your OTP Code",
    html: `
      <div style="font-family: Arial; text-align: center;">
        <h2>🔐 Your OTP Code</h2>
        <p style="font-size: 20px;">Use this code to verify your account:</p>
        <h1 style="color: #007bff;">${otp}</h1>
        <p>This code will expire in 5 minutes.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("📩 Email sent successfully:", info.response);
    return otp;
  } catch (error) {
    console.error("❌ Failed to send email:", error.message);
    throw error;
  }
}



