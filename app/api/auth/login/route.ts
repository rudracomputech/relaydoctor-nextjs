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
    const { password, userRole = 'doctor' } = body;
    const credential = (body.email || body.credential || body.mobile || body.phone || '').trim();

    if (!credential || !password) {
      return jsonError('Email or mobile and password are required', 400);
    }

    const cleanPhone = credential.replace(/\D/g, '');
    const user = await User.findOne({
      $or: [
        { email: credential.toLowerCase() },
        { mobile: credential },
        { phone: credential },
        ...(cleanPhone.length >= 7 ? [{ mobile: cleanPhone }, { phone: cleanPhone }] : []),
      ],
    }).select('+password');

    if (!user) {
      return jsonError('User does not exist with this email or mobile', 400);
    }

    const effectiveRole = (user.userRole || user.role || 'doctor').toLowerCase();
    const requestedRole = (userRole || '').toLowerCase();
    if (requestedRole && requestedRole !== 'all' && effectiveRole !== requestedRole) {
      if (effectiveRole !== 'admin' && requestedRole !== 'admin') {
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
        _id: user._id.toString(),
        sub: user._id.toString(),
        email: user.email,
        role: effectiveRole,
        userRole: effectiveRole,
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    const userObj = {
      id: user._id.toString(),
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      mobile: user.mobile || user.phone || '',
      phone: user.phone || user.mobile || '',
      userRole: effectiveRole,
      role: effectiveRole,
      verified: user.verified ?? user.isVerified ?? false,
      isVerified: user.verified ?? user.isVerified ?? false,
      documentVerification: user.documentVerification ?? null,
      profileImage: user.profileImage ?? user.avatar ?? '',
      avatar: user.avatar ?? user.profileImage ?? '',
      avatarUrl: user.avatar ?? user.profileImage ?? '',
      speciality: user.speciality ?? user.specialization ?? '',
      specialty: user.speciality ?? user.specialization ?? '',
      hospital: user.hospital ?? user.hospitalAddress ?? '',
      walletBalance: user.walletBalance ?? 0,
      totalEarnings: user.totalEarnings ?? 0,
      availabilityStatus: user.availabilityStatus || 'Available',
    };

    return NextResponse.json(
      {
        success: true,
        message: `${effectiveRole} login successful`,
        token,
        jwt: token,
        data: {
          token,
          user: userObj,
        },
        user: userObj,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Auth Login Error:', error);
    return jsonError(error?.message || 'Server error', 500);
  }
}
