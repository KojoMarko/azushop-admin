import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDatabase } from "@/lib/mongodb";
import AdminUser from "@/models/AdminUser";
import bcrypt from "bcryptjs";

export default NextAuth({
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Admin Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await connectToDatabase();
        const user = await AdminUser.findOne({ email: credentials?.email });

        if (!user) throw new Error("No admin user found");
        const isValidPassword = await bcrypt.compare(credentials!.password, user.password);
        if (!isValidPassword) throw new Error("Invalid credentials");

        return { id: user.id, name: user.name, email: user.email };
      },
    }),
  ],
  pages: { signIn: "/admin/login" },
  secret: process.env.NEXTAUTH_SECRET,
});
