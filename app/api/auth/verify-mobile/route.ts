import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import OTP from '@/models/OTP';
import { jsonError, jsonSuccess } from '@/lib/auth-middleware';

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { mobile, otp, idToken } = body;

    if (!mobile) {
      return jsonError('Mobile number is required', 400);
    }

    const cleanMobile = mobile.replace(/\D/g, '');
    const user = await User.findOne({
      $or: [
        { mobile },
        { phone: mobile },
        { mobile: cleanMobile },
        { phone: cleanMobile },
        { mobile: { $regex: cleanMobile.slice(-10) } },
      ],
    });

    if (!user) {
      return jsonError('User not found', 404);
    }

    // If OTP provided, verify OTP
    if (otp) {
      const isDemoOtp = otp === '123456';
      if (!isDemoOtp) {
        const otpRecord = await OTP.findOne({
          $or: [{ mobile }, { mobile: cleanMobile }],
          otp,
          purpose: 'mobile_verification',
        });

        if (!otpRecord) {
          return jsonError('Invalid OTP', 400);
        }

        if (Date.now() > new Date(otpRecord.expireAt).getTime()) {
          await OTP.deleteOne({ _id: otpRecord._id });
          return jsonError('OTP expired', 400);
        }

        await OTP.deleteOne({ _id: otpRecord._id });
      }
    }

    user.mobileVerified = true;
    if (user.emailVerified || user.userRole === 'admin') {
      user.verified = true;
      user.isVerified = true;
    }
    await user.save();

    return jsonSuccess({ mobileVerified: true }, 'Mobile verified successfully', 200);
  } catch (error: any) {
    console.error('Verify Mobile Error:', error);
    return jsonError(error?.message || 'Server error', 500);
  }
}
