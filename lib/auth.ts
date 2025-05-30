import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { connectToDatabase } from "@/lib/mongodb";
import AdminUser from "@/models/AdminUser";
import Otp from "@/models/Otp";
import { sendVerificationEmail } from "@/lib/send-email";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import type { DefaultSession, NextAuthOptions } from "next-auth";

// Extend the built-in session types
// (You can move the declare module block here if you want)

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }
        try {
          await connectToDatabase();
          const user = await AdminUser.findOne({ email: credentials.email });
          if (!user) {
            throw new Error("Invalid email or password");
          }
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );
          if (!isPasswordValid) {
            throw new Error("Invalid email or password");
          }
          if (!user.verified) {
            throw new Error("Please verify your email before logging in");
          }
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
          };
        } catch (error) {
          console.error("Authorization error:", error);
          throw new Error(error instanceof Error ? error.message : "Authorization failed");
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string; name?: string; email?: string }).id = token.id as string;
        (session.user as { id?: string; name?: string; email?: string }).name = token.name as string;
        (session.user as { id?: string; name?: string; email?: string }).email = token.email as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
};

// Generate a 6-digit OTP, save to DB, and return it
export async function generateOtp(email: string): Promise<string> {
  await connectToDatabase();
  const otp = (Math.floor(100000 + Math.random() * 900000)).toString();
  const expiresAt = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes
  // Remove any existing OTPs for this email
  await Otp.deleteMany({ email });
  await Otp.create({ email, otp, expiresAt });
  return otp;
}

// Send OTP email using your existing email sender
export async function sendOtpEmail(email: string, name: string, otp: string) {
  await sendVerificationEmail(email, otp);
}

// Verify OTP: check DB for valid, unexpired OTP, then delete it
export async function verifyOtp(email: string, otp: string): Promise<boolean> {
  await connectToDatabase();
  const record = await Otp.findOne({ email, otp });
  if (!record) return false;
  if (record.expiresAt < new Date()) {
    await Otp.deleteOne({ _id: record._id });
    return false;
  }
  await Otp.deleteOne({ _id: record._id }); // OTP can only be used once
  return true;
}
