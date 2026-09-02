import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOTP extends Document {
  email?: string;
  mobile?: string;
  otp: string;
  purpose: string;
  expireAt: Date;
}

const OTPSchema = new Schema<IOTP>(
  {
    email: { type: String, lowercase: true, trim: true },
    mobile: { type: String, trim: true },
    otp: { type: String, required: true },
    purpose: { type: String, default: 'email_verification' },
    expireAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
  },
  { timestamps: false }
);

export const OTP: Model<IOTP> = mongoose.models.OTP || mongoose.model<IOTP>('OTP', OTPSchema);
export default OTP;
