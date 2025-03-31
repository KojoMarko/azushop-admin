// lib/auth.ts
import jwt from "jsonwebtoken";

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
