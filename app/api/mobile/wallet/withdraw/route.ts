import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Wallet from '@/models/Wallet';
import BankAccount from '@/models/BankAccount';
import WithdrawalRequest from '@/models/WithdrawalRequest';
import Transaction from '@/models/Transaction';
import User from '@/models/User';
import { getAuthenticatedDoctor } from '@/lib/jwt';

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const doctor = await getAuthenticatedDoctor(req);
    if (!doctor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { amount, bankAccountId } = body;

    const withdrawAmount = Number(amount);
    if (!withdrawAmount || withdrawAmount <= 0) {
      return NextResponse.json({ error: 'Invalid withdrawal amount' }, { status: 400 });
    }

    const wallet = await Wallet.findOne({ doctorId: doctor._id });
    if (!wallet || wallet.balance < withdrawAmount) {
      return NextResponse.json({ error: 'Insufficient wallet balance' }, { status: 400 });
    }

    let bankAccount;
    if (bankAccountId) {
      bankAccount = await BankAccount.findById(bankAccountId);
    } else {
      bankAccount = await BankAccount.findOne({ doctorId: doctor._id, isDefault: true });
    }

    if (!bankAccount) {
      return NextResponse.json({ error: 'Please select a valid bank account' }, { status: 400 });
    }

    // Deduct from wallet
    wallet.balance -= withdrawAmount;
    wallet.totalWithdrawn += withdrawAmount;
    await wallet.save();

    await User.findByIdAndUpdate(doctor._id, {
      $inc: { walletBalance: -withdrawAmount },
    });

    const withdrawalRequest = await WithdrawalRequest.create({
      doctorId: doctor._id,
      amount: withdrawAmount,
      bankAccountId: bankAccount._id,
      bankName: bankAccount.bankName,
      accountNumber: bankAccount.accountNumber,
      accountHolderName: bankAccount.accountHolderName,
      status: 'pending',
    });

    await Transaction.create({
      doctorId: doctor._id,
      type: 'withdrawal',
      amount: withdrawAmount,
      direction: 'debit',
      title: 'Withdrawal Request',
      description: `Withdrawal to ${bankAccount.bankName} (${bankAccount.accountNumber})`,
      referenceId: withdrawalRequest._id.toString(),
      status: 'pending',
    });

    return NextResponse.json({
      success: true,
      message: 'Withdrawal request submitted successfully',
      data: withdrawalRequest,
      newBalance: wallet.balance,
    });
  } catch (error: any) {
    console.error('Withdrawal error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
