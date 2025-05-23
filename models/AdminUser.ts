import mongoose, { Schema, Document } from "mongoose";

export interface IAdminUser extends Document {
  name: string;
  email: string;
  password: string;
  verified: boolean;
  createdAt: Date;
}

const AdminUserSchema = new Schema<IAdminUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  verified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.AdminUser || mongoose.model<IAdminUser>("AdminUser", AdminUserSchema);