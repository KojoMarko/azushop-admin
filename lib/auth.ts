import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto";

// Get the secret key from the environment variable
const SECRET_KEY = process.env.JWT_SECRET || "fallback-secret-key"; // Use a fallback key in development

// Generate a JWT token
export const generateToken = (user: any) => {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email }, // Payload containing user details
    SECRET_KEY, // Secret key for signing
    { expiresIn: "1h" } // Token expires in 1 hour
  );
};

// Verify the token
export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, SECRET_KEY); // Verifying the token using the secret key
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: "Gmail", // Use your email service provider
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS, // Your email password
  },
});

// Send OTP via email with improved HTML template
export const sendOtpEmail = async (email: string, name: string, otp: string) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP for Account Verification",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Welcome, ${name}!</h2>
        <p>Thank you for signing up. Please use the following verification code to complete your registration:</p>
        <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
          ${otp}
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("OTP email sent successfully");
    return true;
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Failed to send OTP email");
  }
};

// Temporary in-memory store for OTPs (replace with a database in production)
const otpStore: Record<string, { otp: string; expiresAt: number }> = {};

// Generate and store OTP
export const generateOtp = (email: string): string => {
  const otp = crypto.randomInt(100000, 999999).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes
  otpStore[email] = { otp, expiresAt };
  return otp;
};

// Verify OTP
export const verifyOtp = (email: string, otp: string): boolean => {
  const record = otpStore[email];
  if (!record) return false;
  
  if (record.otp !== otp || record.expiresAt < Date.now()) {
    delete otpStore[email]; // Remove expired or invalid OTP
    return false;
  }
  
  delete otpStore[email]; // Remove OTP after successful verification
  return true;
};

// Sign JWT (alias for generateToken for compatibility)
export const signJwt = (payload: any): string => {
  return generateToken(payload);
};