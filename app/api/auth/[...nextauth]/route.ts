import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { connectToDatabase } from "@/lib/mongodb";
import AdminUser from "@/models/AdminUser";
import bcrypt from "bcryptjs";
import type { DefaultSession, NextAuthOptions } from "next-auth";

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
  }
}

// Create NextAuth options
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
          // Connect to database
          await connectToDatabase();

          // Find user
          const user = await AdminUser.findOne({ email: credentials.email });
          if (!user) {
            throw new Error("Invalid email or password"); // NextAuth maps this to "CredentialsSignin" error by default
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            throw new Error("Invalid email or password"); // NextAuth maps this to "CredentialsSignin" error by default
          }

          // Check if user is verified
          if (!user.verified) {
            // Use a specific error message that can be caught in the UI
            throw new Error("Please verify your email before logging in");
          }

          // Return user object that will be saved in the JWT
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
          };
        } catch (error) {
          console.error("Authorization error:", error);
          // Re-throw the specific error message if available, otherwise a generic one
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
    error: "/login", // Restored this line to handle error redirects
  },
  callbacks: {
    async jwt({ token, user }) {
      // Add user data to token when signing in
      if (user) {
        token.id = user.id;
        token.name = user.name; // Add the name to the token
        token.email = user.email; // Ensure email is also stored
      }
      return token;
    },
    async session({ session, token }) {
      // Add user data to session
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string; // Add the name to the session
        session.user.email = token.email as string; // Ensure email is also stored
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
};

// Create handler
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };