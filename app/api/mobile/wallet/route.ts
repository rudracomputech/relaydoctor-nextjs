import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Wallet from '@/models/Wallet';
import Transaction from '@/models/Transaction';
import { getAuthenticatedDoctor } from '@/lib/jwt';

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const doctor = await getAuthenticatedDoctor(req);
    if (!doctor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let wallet = await Wallet.findOne({ doctorId: doctor._id });
    if (!wallet) {
      wallet = await Wallet.create({
        doctorId: doctor._id,
        balance: doctor.walletBalance || 0,
        totalEarnings: doctor.totalEarnings || 0,
        totalWithdrawn: 0,
      });
    }

    // Recent transactions for wallet preview (matching Figma My Wallet screen)
    const recentTransactions = await Transaction.find({ doctorId: doctor._id })
      .sort({ createdAt: -1 })
      .limit(10);

    return NextResponse.json({
      success: true,
      wallet: {
        balance: wallet.balance,
        totalEarnings: wallet.totalEarnings,
        totalWithdrawn: wallet.totalWithdrawn,
      },
      recentTransactions,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
