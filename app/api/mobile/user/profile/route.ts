import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getAuthenticatedDoctor } from '@/lib/jwt';
import User from '@/models/User';
import Wallet from '@/models/Wallet';

export async function GET(req: Request) {
  try {
    const doctor = await getAuthenticatedDoctor(req);
    if (!doctor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const wallet = await Wallet.findOne({
      $or: [{ doctorId: doctor._id }, { user: doctor._id }],
    }).lean();

    const currentDoctor = await User.findById(doctor._id).select('-password').lean();
    if (!currentDoctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }

    const doctorProfile = {
      ...currentDoctor,
      _id: currentDoctor._id.toString(),
      walletBalance: wallet
        ? (wallet.availableBalance ?? wallet.balance ?? 0)
        : (currentDoctor.walletBalance ?? 0),
      totalEarnings: wallet
        ? (wallet.totalEarnings ?? 0)
        : (currentDoctor.totalEarnings ?? 0),
      pendingBalance: wallet ? (wallet.pendingBalance ?? 0) : 0,
      totalWithdrawn: wallet ? (wallet.totalWithdrawn ?? 0) : 0,
      wallet: wallet
        ? {
            _id: wallet._id.toString(),
            balance: wallet.availableBalance ?? wallet.balance ?? 0,
            availableBalance: wallet.availableBalance ?? wallet.balance ?? 0,
            pendingBalance: wallet.pendingBalance ?? 0,
            totalEarnings: wallet.totalEarnings ?? 0,
            totalWithdrawn: wallet.totalWithdrawn ?? 0,
            currency: wallet.currency || 'INR',
            isActive: wallet.isActive ?? true,
          }
        : {
            balance: currentDoctor.walletBalance ?? 0,
            availableBalance: currentDoctor.walletBalance ?? 0,
            pendingBalance: 0,
            totalEarnings: currentDoctor.totalEarnings ?? 0,
            totalWithdrawn: 0,
            currency: 'INR',
            isActive: true,
          },
    };

    return NextResponse.json({
      success: true,
      data: doctorProfile,
      doctor: doctorProfile,
    });
  } catch (error: any) {
    console.error('Mobile GET Profile Error:', error);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const doctor = await getAuthenticatedDoctor(req);
    if (!doctor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const body = await req.json();

    const allowedUpdates = [
      'name',
      'phone',
      'bio',
      'consultationFee',
      'specialization',
      'speciality',
      'hospital',
      'hospitalAddress',
      'clinicAddress',
      'city',
      'location',
      'age',
      'gender',
      'workSchedule',
      'availabilityStatus',
      'avatar',
      'profileImage',
      'additionalAddresses',
    ];

    const updates: Record<string, any> = {};
    for (const key of allowedUpdates) {
      if (body[key] !== undefined) {
        updates[key] = body[key];
      }
    }

    const updatedDoctor = await User.findByIdAndUpdate(doctor._id, updates, {
      new: true,
    }).select('-password').lean();

    if (!updatedDoctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }

    const wallet = await Wallet.findOne({
      $or: [{ doctorId: doctor._id }, { user: doctor._id }],
    }).lean();

    const doctorProfile = {
      ...updatedDoctor,
      _id: updatedDoctor._id.toString(),
      walletBalance: wallet
        ? (wallet.availableBalance ?? wallet.balance ?? 0)
        : (updatedDoctor.walletBalance ?? 0),
      totalEarnings: wallet
        ? (wallet.totalEarnings ?? 0)
        : (updatedDoctor.totalEarnings ?? 0),
      pendingBalance: wallet ? (wallet.pendingBalance ?? 0) : 0,
      totalWithdrawn: wallet ? (wallet.totalWithdrawn ?? 0) : 0,
      wallet: wallet
        ? {
            _id: wallet._id.toString(),
            balance: wallet.availableBalance ?? wallet.balance ?? 0,
            availableBalance: wallet.availableBalance ?? wallet.balance ?? 0,
            pendingBalance: wallet.pendingBalance ?? 0,
            totalEarnings: wallet.totalEarnings ?? 0,
            totalWithdrawn: wallet.totalWithdrawn ?? 0,
            currency: wallet.currency || 'INR',
            isActive: wallet.isActive ?? true,
          }
        : {
            balance: updatedDoctor.walletBalance ?? 0,
            availableBalance: updatedDoctor.walletBalance ?? 0,
            pendingBalance: 0,
            totalEarnings: updatedDoctor.totalEarnings ?? 0,
            totalWithdrawn: 0,
            currency: 'INR',
            isActive: true,
          },
    };

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: doctorProfile,
      doctor: doctorProfile,
    });
  } catch (error: any) {
    console.error('Mobile PUT Profile Error:', error);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}