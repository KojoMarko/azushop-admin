// lib/auth.ts
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

// Get the secret key from the environment variable
const SECRET_KEY = process.env.JWT_SECRET || "fallback-secret-key";  // Use a fallback key in development

// Generate a JWT token
export const generateToken = (user: any) => {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email },  // Payload containing user details
    SECRET_KEY,  // Secret key for signing
    { expiresIn: "1h" }  // Token expires in 1 hour
  );
};

// Verify the token
export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, SECRET_KEY);  // Verifying the token using the secret key
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};

const transporter = nodemailer.createTransport({
  service: "Gmail", // Use your email service provider
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS, // Your email password
  },
});

export const sendOtpEmail = async (email: string, otp: string) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP for Account Verification",
    text: `Your OTP is: ${otp}. It is valid for 10 minutes.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("OTP email sent successfully");
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Failed to send OTP email");
  }
};
