import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import OTP from '@/models/OTP';
import { generateOtp } from '@/utils/otp';
import { sendEmail } from '@/utils/sendEmail';
import { jsonError, jsonSuccess } from '@/lib/auth-middleware';

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { name, email, mobile, dateOfBirth, speciality, password, userRole = 'user' } = body;

    if (!name || !email || !mobile || !dateOfBirth || !password) {
      return jsonError('All fields are required', 400);
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check existing user
    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { mobile }, { phone: mobile }],
    });

    if (existingUser) {
      if (existingUser.verified || existingUser.isVerified) {
        return jsonError('User already exists. Please login.', 400);
      }

      const { otp: emailOTP, expire: emailExpire } = generateOtp();
      await OTP.findOneAndUpdate(
        { email: normalizedEmail, purpose: 'email_verification' },
        { otp: emailOTP, expireAt: emailExpire },
        { upsert: true, new: true }
      );

      await sendEmail({
        to: normalizedEmail,
        subject: 'Email Verification OTP',
        message: `Your OTP for email verification is: ${emailOTP}`,
      });

      return jsonSuccess(
        null,
        'Already registered but not verified. Email OTP sent. Mobile verification via Firebase.',
        200
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const { otp: emailOTP, expire: emailExpire } = generateOtp();

    await OTP.findOneAndUpdate(
      { email: normalizedEmail, purpose: 'email_verification' },
      { otp: emailOTP, expireAt: emailExpire },
      { upsert: true, new: true }
    );

    await User.create({
      name,
      email: normalizedEmail,
      mobile,
      phone: mobile,
      dateOfBirth: new Date(dateOfBirth),
      speciality: speciality || 'General Physician',
      specialization: speciality || 'General Physician',
      password: hashedPassword,
      userRole,
      role: userRole as any,
      verified: false,
      isVerified: false,
      emailVerified: false,
      mobileVerified: false,
    });

    await sendEmail({
      to: normalizedEmail,
      subject: 'Email Verification OTP',
      message: `Your OTP for email verification is: ${emailOTP}`,
    });

    return jsonSuccess(
      null,
      'User registered. Email OTP sent. Mobile verification via Firebase.',
      201
    );
  } catch (error: any) {
    console.error('Register API Error:', error);
    return jsonError(error?.message || 'Server error', 500);
  }
}
