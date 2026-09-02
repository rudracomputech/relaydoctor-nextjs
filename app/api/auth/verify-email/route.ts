import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import OTP from '@/models/OTP';
import { jsonError, jsonSuccess } from '@/lib/auth-middleware';

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return jsonError('Email and OTP are required', 400);
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return jsonError('User not found', 404);
    }

    const otpRecord = await OTP.findOne({
      email: normalizedEmail,
      otp,
      purpose: 'email_verification',
    });

    if (!otpRecord) {
      return jsonError('Invalid OTP', 400);
    }

    if (Date.now() > new Date(otpRecord.expireAt).getTime()) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return jsonError('OTP expired', 400);
    }

    user.emailVerified = true;
    if (user.mobileVerified || user.userRole === 'admin') {
      user.verified = true;
      user.isVerified = true;
    }
    await user.save();
    await OTP.deleteOne({ _id: otpRecord._id });

    return jsonSuccess({ emailVerified: true }, 'Email verified successfully', 200);
  } catch (error: any) {
    console.error('Verify Email Error:', error);
    return jsonError(error?.message || 'Server error', 500);
  }
}
