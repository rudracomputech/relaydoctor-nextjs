import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import Wallet from '@/models/Wallet';

export async function GET(req: Request, context: any) {
  try {
    const params = typeof context?.params?.then === 'function' ? await context.params : context?.params;
    const { id } = params;

    await connectToDatabase();
    const doctor = await User.findById(id).select('-password').lean();
    if (!doctor || (doctor.role !== 'doctor' && doctor.userRole !== 'doctor')) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }

    const wallet = await Wallet.findOne({
      $or: [{ doctorId: doctor._id }, { user: doctor._id }],
    }).lean();

    const doctorProfile = {
      ...doctor,
      walletBalance: wallet
        ? (wallet.availableBalance ?? wallet.balance ?? 0)
        : (doctor.walletBalance ?? 0),
      totalEarnings: wallet
        ? (wallet.totalEarnings ?? 0)
        : (doctor.totalEarnings ?? 0),
      pendingBalance: wallet ? (wallet.pendingBalance ?? 0) : 0,
      totalWithdrawn: wallet ? (wallet.totalWithdrawn ?? 0) : 0,
      wallet: wallet
        ? {
            _id: wallet._id,
            balance: wallet.availableBalance ?? wallet.balance ?? 0,
            availableBalance: wallet.availableBalance ?? wallet.balance ?? 0,
            pendingBalance: wallet.pendingBalance ?? 0,
            totalEarnings: wallet.totalEarnings ?? 0,
            totalWithdrawn: wallet.totalWithdrawn ?? 0,
            currency: wallet.currency || 'INR',
            isActive: wallet.isActive ?? true,
          }
        : {
            balance: doctor.walletBalance ?? 0,
            availableBalance: doctor.walletBalance ?? 0,
            pendingBalance: 0,
            totalEarnings: doctor.totalEarnings ?? 0,
            totalWithdrawn: 0,
            currency: 'INR',
            isActive: true,
          },
    };

    return NextResponse.json({ success: true, doctor: doctorProfile });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
