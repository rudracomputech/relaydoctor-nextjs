import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import Wallet from '@/models/Wallet';
import Transaction from '@/models/Transaction';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { doctorId, action, amount, type, description, note } = body;

    if (!doctorId) {
      return NextResponse.json({ error: 'Doctor ID is required' }, { status: 400 });
    }
    if (!action || !['credit', 'debit'].includes(action)) {
      return NextResponse.json({ error: 'Valid action (credit or debit) is required' }, { status: 400 });
    }
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than 0' }, { status: 400 });
    }

    await connectToDatabase();

    const doctor = await User.findById(doctorId);
    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }

    let wallet = await Wallet.findOne({
      $or: [{ user: doctorId }, { doctorId: doctorId }],
    });

    if (!wallet) {
      wallet = await Wallet.create({
        user: doctorId,
        doctorId: doctorId,
        availableBalance: doctor.walletBalance || 0,
        balance: doctor.walletBalance || 0,
        pendingBalance: 0,
        totalEarnings: doctor.totalEarnings || 0,
        totalWithdrawn: 0,
        currency: 'INR',
      });
    }

    const currentBalance = wallet.availableBalance ?? wallet.balance ?? 0;

    if (action === 'debit' && currentBalance < numAmount) {
      return NextResponse.json(
        {
          error: `Insufficient balance. Current balance is ₹${currentBalance}, cannot debit ₹${numAmount}.`,
        },
        { status: 400 }
      );
    }

    const balanceBefore = currentBalance;
    const balanceAfter = action === 'credit' ? currentBalance + numAmount : currentBalance - numAmount;
    const newTotalEarnings =
      action === 'credit' ? (wallet.totalEarnings || 0) + numAmount : wallet.totalEarnings || 0;

    wallet.availableBalance = balanceAfter;
    wallet.balance = balanceAfter;
    if (action === 'credit') {
      wallet.totalEarnings = newTotalEarnings;
    }
    await wallet.save();

    // Update doctor User model
    doctor.walletBalance = balanceAfter;
    if (action === 'credit') {
      doctor.totalEarnings = newTotalEarnings;
    }
    await doctor.save();

    const txType = type || (action === 'credit' ? 'manual_credit' : 'manual_debit');
    const txTitle =
      action === 'credit'
        ? `Manual Credit: ₹${numAmount}`
        : `Manual Debit: ₹${numAmount}`;
    const txDesc = description || note || `Admin balance adjustment on Dr. ${doctor.name}`;

    const transaction = await Transaction.create({
      wallet: wallet._id,
      user: doctorId,
      doctorId: doctorId,
      type: txType,
      transactionType: action === 'credit' ? 'Credit' : 'Debit',
      direction: action,
      amount: numAmount,
      balanceBefore,
      balanceAfter,
      status: 'completed',
      title: txTitle,
      description: txDesc,
      referenceId: `ADJ-${Date.now().toString().slice(-6)}`,
      referenceModel: 'ManualAdjustment',
    });

    return NextResponse.json({
      success: true,
      message: `Successfully ${action === 'credit' ? 'credited' : 'debited'} ₹${numAmount} to Dr. ${doctor.name}`,
      data: {
        balance: balanceAfter,
        availableBalance: balanceAfter,
        totalEarnings: wallet.totalEarnings,
        transaction,
      },
    });
  } catch (error: any) {
    console.error('Admin Wallet Adjust Error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
