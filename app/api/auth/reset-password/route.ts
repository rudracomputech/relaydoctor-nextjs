import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import OTP from '@/models/OTP';
import { jsonError, jsonSuccess } from '@/lib/auth-middleware';

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { email, mobile, otp, newPassword } = await req.json();

    if (!otp || !newPassword || (!email && !mobile)) {
      return jsonError('OTP, new password, and email or mobile are required', 400);
    }

    let user;
    let otpRecord;

    if (email) {
      const normalizedEmail = email.toLowerCase().trim();
      user = await User.findOne({ email: normalizedEmail });
      if (!user) return jsonError('User not found', 404);

      otpRecord = await OTP.findOne({
        email: normalizedEmail,
        otp,
        purpose: 'forgot_password',
      });
    } else if (mobile) {
      user = await User.findOne({ $or: [{ mobile }, { phone: mobile }] });
      if (!user) return jsonError('User not found', 404);

      otpRecord = await OTP.findOne({
        mobile,
        otp,
        purpose: 'forgot_password',
      });
    }

    if (!otpRecord) {
      return jsonError('Invalid OTP', 400);
    }

    if (Date.now() > new Date(otpRecord.expireAt).getTime()) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return jsonError('OTP expired', 400);
    }

    if (!user) {
      return jsonError('User not found', 404);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    await user.save();

    await OTP.deleteOne({ _id: otpRecord._id });

    return jsonSuccess(null, 'Password reset successful', 200);
  } catch (error: any) {
    console.error('Reset Password Error:', error);
    return jsonError(error?.message || 'Server error', 500);
  }
}
