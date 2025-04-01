// /app/api/auth/send-otp/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import AdminUser from '@/models/AdminUser';
import { generateOtp, sendOtpEmail } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();
    
    if (!name || !email) {
      return NextResponse.json({
        success: false,
        message: 'Name and email are required'
      }, { status: 400 });
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Check if user already exists
    const existingUser = await AdminUser.findOne({ email });
    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: 'An account with this email already exists'
      }, { status: 400 });
    }
    
    // Generate OTP
    const otp = generateOtp(email);
    
    // Send OTP via email
    await sendOtpEmail(email, name, otp);
    
    // Store user data in session storage on client side
    // The actual user will be created after OTP verification
    
    return NextResponse.json({ 
      success: true, 
      message: 'OTP sent successfully'
    });
  } catch (error) {
    console.error('Error details:', error);

    // Return a more descriptive error message
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An unknown error occurred',
      },
      { status: 500 }
    );
  }
}