import { NextResponse } from 'next/server';
import { authenticateRequest, jsonError, jsonSuccess } from '@/lib/auth-middleware';
import BankAccount from '@/models/BankAccount';

export async function POST(req: Request) {
  try {
    const { user, errorResponse } = await authenticateRequest(req);
    if (errorResponse) return errorResponse;

    const userId = user!._id;
    const body = await req.json();
    const {
      accountHolderName,
      bankName,
      accountNumber,
      ifscCode,
      ifscOrRouting,
      branchName,
      accountType,
      upiId,
    } = body;

    const ifsc = ifscCode || ifscOrRouting;

    if (!accountHolderName || !bankName || !accountNumber || !ifsc) {
      return jsonError('Required fields are missing: accountHolderName, bankName, accountNumber, ifscCode', 400);
    }

    const existing = await BankAccount.findOne({
      $or: [{ user: userId }, { doctorId: userId }],
      accountNumber,
      isActive: true,
    });

    if (existing) {
      return jsonError('Bank account already exists.', 400);
    }

    const hasDefault = await BankAccount.findOne({
      $or: [{ user: userId }, { doctorId: userId }],
      isDefault: true,
      isActive: true,
    });

    const bank = await BankAccount.create({
      user: userId,
      doctorId: userId,
      accountHolderName,
      bankName,
      accountNumber,
      ifscCode: ifsc.toUpperCase(),
      ifscOrRouting: ifsc.toUpperCase(),
      branchName: branchName || '',
      accountType: accountType || 'Savings',
      upiId: upiId || '',
      isDefault: !hasDefault,
      isActive: true,
    });

    return jsonSuccess(bank, 'Bank account added successfully.', 201, { data: bank });
  } catch (error: any) {
    console.error('Add Bank Account Error:', error);
    return jsonError(error?.message || 'Server error', 500);
  }
}

export async function GET(req: Request) {
  try {
    const { user, errorResponse } = await authenticateRequest(req);
    if (errorResponse) return errorResponse;

    const userId = user!._id;

    const accounts = await BankAccount.find({
      $or: [{ user: userId }, { doctorId: userId }],
      isActive: true,
    }).sort({
      isDefault: -1,
      createdAt: -1,
    });

    return jsonSuccess(accounts, 'Bank accounts fetched successfully.', 200, {
      total: accounts.length,
      data: accounts,
    });
  } catch (error: any) {
    console.error('Get Bank Accounts Error:', error);
    return jsonError(error?.message || 'Server error', 500);
  }
}
