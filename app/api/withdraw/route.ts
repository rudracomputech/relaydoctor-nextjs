import { NextResponse } from 'next/server';
import { authenticateRequest, jsonError, jsonSuccess } from '@/lib/auth-middleware';
import Wallet from '@/models/Wallet';
import WithdrawalRequest from '@/models/WithdrawalRequest';
import BankAccount from '@/models/BankAccount';
import { debitWallet } from '@/services/walletService';

export async function POST(req: Request) {
  try {
    const { user, errorResponse } = await authenticateRequest(req);
    if (errorResponse) return errorResponse;

    const userId = user!._id;
    const body = await req.json();
    const amount = Number(body.amount);

    if (!amount || amount <= 0) {
      return jsonError('Valid amount is required.', 400);
    }

    const wallet = await Wallet.findOne({
      $or: [{ user: userId }, { doctorId: userId }],
    });

    if (!wallet) {
      return jsonError('Wallet not found.', 404);
    }

    const currentBalance = wallet.availableBalance ?? wallet.balance ?? 0;
    if (currentBalance < amount) {
      return jsonError('Insufficient wallet balance.', 400);
    }

    const pendingRequest = await WithdrawalRequest.findOne({
      $or: [{ user: userId }, { doctorId: userId }],
      status: { $in: ['Pending', 'Approved', 'Processing', 'pending', 'approved'] },
    });

    if (pendingRequest) {
      return jsonError('You already have a pending withdrawal request.', 400);
    }

    // Find default bank account if any
    const defaultBank = await BankAccount.findOne({
      $or: [{ user: userId }, { doctorId: userId }],
      isDefault: true,
      isActive: true,
    });

    await debitWallet({
      userId,
      amount,
      type: 'Withdrawal',
      description: 'Withdrawal request.',
      status: 'Pending',
    });

    const withdraw = await WithdrawalRequest.create({
      user: userId,
      doctorId: userId,
      wallet: wallet._id,
      amount,
      bankAccount: defaultBank ? (defaultBank._id as any) : undefined,
      bankAccountId: defaultBank ? (defaultBank._id as any) : undefined,
      bankName: defaultBank ? defaultBank.bankName : '',
      accountNumber: defaultBank ? defaultBank.accountNumber : '',
      accountHolderName: defaultBank ? defaultBank.accountHolderName : user!.name,
      status: 'Pending',
    });

    return jsonSuccess(withdraw, 'Withdrawal request submitted successfully.', 201, { data: withdraw });
  } catch (error: any) {
    console.error('Create Withdraw Request Error:', error);
    return jsonError(error?.message || 'Server error', 500);
  }
}

export async function GET(req: Request) {
  try {
    const { user, errorResponse } = await authenticateRequest(req);
    if (errorResponse) return errorResponse;

    const userId = user!._id;

    const requests = await WithdrawalRequest.find({
      $or: [{ user: userId }, { doctorId: userId }],
    }).sort({ createdAt: -1 });

    return jsonSuccess(requests, 'Withdrawal history fetched.', 200, {
      total: requests.length,
      data: requests,
    });
  } catch (error: any) {
    console.error('Get Withdraw History Error:', error);
    return jsonError(error?.message || 'Server error', 500);
  }
}
