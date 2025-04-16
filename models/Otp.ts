import mongoose, { Document, Schema } from 'mongoose';

export interface OtpDocument extends Document {
  email: string;
  otp: string;
  expiresAt: Date;
}

const OtpSchema = new Schema<OtpDocument>({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true },
});

export default mongoose.models.Otp || mongoose.model<OtpDocument>('Otp', OtpSchema);
