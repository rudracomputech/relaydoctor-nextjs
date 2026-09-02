import { NextResponse } from 'next/server';
import { authenticateRequest, jsonError, jsonSuccess } from '@/lib/auth-middleware';
import Wallet from '@/models/Wallet';
import Transaction from '@/models/Transaction';

export async function GET(req: Request) {
  try {
    const { user, errorResponse } = await authenticateRequest(req);
    if (errorResponse) return errorResponse;

    const userId = user!._id;

    let wallet = await Wallet.findOne({
      $or: [{ user: userId }, { doctorId: userId }],
    });

    if (!wallet) {
      wallet = await Wallet.create({
        user: userId,
        doctorId: userId,
        availableBalance: user!.walletBalance || 0,
        balance: user!.walletBalance || 0,
        pendingBalance: 0,
        totalEarnings: user!.totalEarnings || 0,
        totalWithdrawn: 0,
        currency: 'INR',
      });
    }

    const recentTransactions = await Transaction.find({
      $or: [{ user: userId }, { doctorId: userId }],
    })
      .sort({ createdAt: -1 })
      .limit(5);

    const data = {
      walletId: wallet._id,
      availableBalance: wallet.availableBalance ?? wallet.balance ?? 0,
      balance: wallet.availableBalance ?? wallet.balance ?? 0,
      pendingBalance: wallet.pendingBalance ?? 0,
      totalEarnings: wallet.totalEarnings ?? 0,
      totalWithdrawn: wallet.totalWithdrawn ?? 0,
      currency: wallet.currency || 'INR',
      recentTransactions,
    };

    return jsonSuccess(data, 'Wallet fetched successfully.', 200, { data });
  } catch (error: any) {
    console.error('Get Wallet Error:', error);
    return jsonError(error?.message || 'Server error', 500);
  }
}
