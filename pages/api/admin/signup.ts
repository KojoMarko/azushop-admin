import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/mongodb";
import AdminUser from "@/models/AdminUser";
import bcrypt from "bcryptjs";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method Not Allowed" });

  await connectToDatabase();

  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const existingUser = await AdminUser.findOne({ email });
  if (existingUser) return res.status(400).json({ message: "Admin user already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new AdminUser({
    name,
    email,
    password: hashedPassword,
  });

  await newUser.save();
  res.status(201).json({ message: "Admin user registered successfully" });
}
