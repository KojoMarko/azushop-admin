// app/api/auth/verify-otp/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import AdminUser from "@/models/AdminUser";
import { verifyOtp } from "@/lib/auth";
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
    let user = await AdminUser.findOne({ email });
    
    if (user) {
      // If user already exists but isn't verified, update verification status
      if (!user.verified) {
        user.verified = true;
        await user.save();
      } else {
        return NextResponse.json({ 
          success: false, 
          message: "User with this email already exists and is verified" 
        }, { status: 400 });
      }
    } else {
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
      user = await AdminUser.create({
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        verified: true,
        createdAt: new Date()
      });
    }
    
    // Return success response without JWT token - let NextAuth handle auth
    return NextResponse.json({ 
      success: true, 
      message: "Email verified successfully! Your account has been created.",
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email
      }
    });
    
  } catch (error) {
    console.error("Error verifying OTP:", error);
    
    return NextResponse.json({ 
      success: false, 
      message: error instanceof Error ? error.message : "An internal server error occurred"
    }, { status: 500 });
  }
}