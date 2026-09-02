import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import OTP from '@/models/OTP';
import { generateOtp } from '@/utils/otp';
import { jsonError, jsonSuccess } from '@/lib/auth-middleware';

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { mobile } = await req.json();

    if (!mobile) {
      return jsonError('Mobile number is required', 400);
    }

    const user = await User.findOne({
      $or: [{ mobile }, { phone: mobile }],
    });

    if (!user) {
      return jsonError('User not found', 404);
    }

    if (user.mobileVerified) {
      return jsonError('Mobile number already verified', 400);
    }

    const { otp, expire } = generateOtp();
    await OTP.findOneAndUpdate(
      { mobile, purpose: 'mobile_verification' },
      { otp, expireAt: expire },
      { upsert: true, new: true }
    );

    console.log(`[SMS OTP MOCK] Mobile: ${mobile} | OTP: ${otp}`);

    return jsonSuccess(null, 'OTP sent to mobile successfully', 200);
  } catch (error: any) {
    console.error('Resend Mobile OTP Error:', error);
    return jsonError(error?.message || 'Server error', 500);
  }
}
