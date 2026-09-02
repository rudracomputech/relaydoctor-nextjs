import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import OTP from '@/models/OTP';
import { generateOtp } from '@/utils/otp';
import { sendEmail } from '@/utils/sendEmail';
import { jsonError, jsonSuccess } from '@/lib/auth-middleware';

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { email } = await req.json();

    if (!email) {
      return jsonError('Email is required', 400);
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return jsonError('User not found', 404);
    }

    if (user.emailVerified) {
      return jsonError('Email already verified', 400);
    }

    const { otp, expire } = generateOtp();
    await OTP.findOneAndUpdate(
      { email: normalizedEmail, purpose: 'email_verification' },
      { otp, expireAt: expire },
      { upsert: true, new: true }
    );

    await sendEmail({
      to: normalizedEmail,
      subject: 'Resend Email Verification OTP',
      message: `Your new OTP for email verification is: ${otp}`,
    });

    return jsonSuccess(null, 'OTP sent to email successfully', 200);
  } catch (error: any) {
    console.error('Resend Email OTP Error:', error);
    return jsonError(error?.message || 'Server error', 500);
  }
}
