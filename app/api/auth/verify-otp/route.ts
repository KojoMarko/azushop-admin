import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import AdminUser from "@/models/AdminUser"; // Assuming a Mongoose model for admin users
import { verifyOtp } from "@/lib/auth"; // Utility to verify OTP
import { signJwt } from "@/lib/auth"; // Utility to sign JWT tokens

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });
    }

    // Verify the OTP
    const isValidOtp = await verifyOtp(email, otp);
    if (!isValidOtp) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
    }

    // Ensure database connection
    await connectToDatabase();

    // Fetch user data from the database using the AdminUser model
    const user = await AdminUser.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate a JWT token for the user
    const token = signJwt({ id: user._id, email: user.email });

    // Return success response with the token
    return NextResponse.json({ message: "OTP verified successfully", token });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}