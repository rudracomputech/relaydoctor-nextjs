import { NextResponse } from 'next/server';
import { authenticateRequest, jsonError, jsonSuccess } from '@/lib/auth-middleware';
import Transaction from '@/models/Transaction';

export async function GET(req: Request) {
  try {
    const { user, errorResponse } = await authenticateRequest(req);
    if (errorResponse) return errorResponse;

    const userId = user!._id;

    const transactions = await Transaction.find({
      $or: [{ user: userId }, { doctorId: userId }],
    }).sort({ createdAt: -1 });

    return jsonSuccess(transactions, 'Transactions fetched successfully.', 200, {
      total: transactions.length,
      data: transactions,
    });
  } catch (error: any) {
    console.error('Get Wallet Transactions Error:', error);
    return jsonError(error?.message || 'Server error', 500);
  }
}
