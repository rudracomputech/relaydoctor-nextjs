import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import Wallet from '@/models/Wallet';
import { generateToken } from '@/lib/jwt';

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { name, email, password, phone, specialization, hospital } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists with this email' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone || '',
      role: 'doctor',
      specialization: specialization || 'General Physician',
      hospital: hospital || '',
      walletBalance: 0,
      totalEarnings: 0,
      isVerified: true,
    });

    // Create initial wallet
    await Wallet.create({
      doctorId: user._id,
      balance: 0,
      totalEarnings: 0,
      totalWithdrawn: 0,
    });

    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Doctor registered successfully',
        token,
        jwt: token,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          specialization: user.specialization,
          hospital: user.hospital,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Mobile register error:', error);
    return NextResponse.json({ error: 'Server error: ' + error.message }, { status: 500 });
  }
}
