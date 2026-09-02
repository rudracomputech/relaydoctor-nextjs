import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { jsonError } from '@/lib/auth-middleware';

const JWT_SECRET = process.env.JWT_SECRET || 'RS5yLeg6sbhW17foiW7pWz6HxNl6XGO34na7mJh6USa';

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { email, password, userRole = 'doctor' } = body;

    if (!email || !password) {
      return jsonError('Email and password are required', 400);
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      return jsonError('User does not exist with this email', 400);
    }

    const effectiveRole = user.userRole || user.role;
    if (userRole && effectiveRole !== userRole) {
      // Allow fallback if user has 'doctor' and asked for 'doctor' or 'admin'
      if (effectiveRole !== 'admin' && effectiveRole !== userRole) {
        return jsonError(`This account is not registered as ${userRole}`, 403);
      }
    }

    if (user.password) {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return jsonError('Invalid credentials', 400);
      }
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        id: user._id.toString(),
        email: user.email,
        role: effectiveRole,
        userRole: effectiveRole,
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return NextResponse.json(
      {
        success: true,
        message: `${effectiveRole} login successful`,
        token,
        jwt: token,
        user: {
          id: user._id.toString(),
          _id: user._id.toString(),
          name: user.name,
          email: user.email,
          userRole: effectiveRole,
          role: effectiveRole,
          verified: user.verified ?? user.isVerified ?? false,
          documentVerification: user.documentVerification ?? null,
          profileImage: user.profileImage ?? user.avatar ?? '',
          speciality: user.speciality ?? user.specialization ?? '',
          hospital: user.hospital ?? user.hospitalAddress ?? '',
          walletBalance: user.walletBalance ?? 0,
          totalEarnings: user.totalEarnings ?? 0,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Auth Login Error:', error);
    return jsonError(error?.message || 'Server error', 500);
  }
}
