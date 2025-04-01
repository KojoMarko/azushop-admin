// /app/api/auth/verify-otp/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import AdminUser from "@/models/AdminUser";
import { verifyOtp, signJwt } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, otp, userData } = await req.json();
    
    if (!email || !otp) {
      return NextResponse.json({ 
        success: false, 
        message: "Email and OTP are required" 
      }, { status: 400 });
    }
    
    // Verify the OTP
    const isValidOtp = verifyOtp(email, otp);
    if (!isValidOtp) {
      return NextResponse.json({ 
        success: false, 
        message: "Invalid or expired verification code" 
      }, { status: 400 });
    }
    
    // OTP is valid, proceed with registration
    await connectToDatabase();
    
    // Check if the user already exists
    const existingUser = await AdminUser.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ 
        success: false, 
        message: "User with this email already exists" 
      }, { status: 400 });
    }
    
    // Ensure we have the user data
    if (!userData || !userData.name || !userData.email || !userData.password) {
      return NextResponse.json({ 
        success: false, 
        message: "User data is incomplete" 
      }, { status: 400 });
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    // Create the new user
    const newUser = await AdminUser.create({
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      verified: true,
      createdAt: new Date()
    });
    
    // Generate a JWT token for the user
    const token = signJwt({ 
      id: newUser._id, 
      name: newUser.name,
      email: newUser.email
    });
    
    // Return success response with token
    return NextResponse.json({ 
      success: true, 
      message: "Email verified successfully! Your account has been created.",
      token
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    
    return NextResponse.json({ 
      success: false, 
      message: error instanceof Error ? error.message : "An internal server error occurred"
    }, { status: 500 });
  }
}