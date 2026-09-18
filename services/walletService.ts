import Wallet from '@/models/Wallet';
import Transaction from '@/models/Transaction';
import User from '@/models/User';
import mongoose from 'mongoose';

export async function creditWallet({
  userId,
  amount,
  type,
  description = '',
  referenceId = null,
  referenceModel = null,
  status = 'Completed',
}: {
  userId: string | mongoose.Types.ObjectId;
  amount: number;
  type: string;
  description?: string;
  referenceId?: string | null;
  referenceModel?: string | null;
  status?: string;
}) {
  let wallet = await Wallet.findOne({
    $or: [{ user: userId }, { doctorId: userId }],
  });

  if (!wallet) {
    wallet = await Wallet.create({
      user: userId,
      doctorId: userId,
      availableBalance: 0,
      balance: 0,
      pendingBalance: 0,
      totalEarnings: 0,
      totalWithdrawn: 0,
    });
  }

  const balanceBefore = wallet.availableBalance ?? wallet.balance ?? 0;
  const newAvailable = balanceBefore + amount;
  const newEarnings = (wallet.totalEarnings || 0) + amount;

  wallet.availableBalance = newAvailable;
  wallet.balance = newAvailable;
  wallet.totalEarnings = newEarnings;
  await wallet.save();

  await User.findByIdAndUpdate(userId, {
    walletBalance: newAvailable,
    totalEarnings: newEarnings,
  });

  const transaction = await Transaction.create({
    wallet: wallet._id,
    user: userId,
    doctorId: userId,
    type,
    transactionType: 'Credit',
    direction: 'credit',
    amount,
    balanceBefore,
    balanceAfter: newAvailable,
    status,
    description,
    title: description || type,
    referenceId: referenceId || undefined,
    referenceModel: referenceModel || undefined,
  });

  return { wallet, transaction };
}

export async function debitWallet({
  userId,
  amount,
  type,
  description = '',
  referenceId = null,
  referenceModel = null,
  status = 'Completed',
}: {
  userId: string | mongoose.Types.ObjectId;
  amount: number;
  type: string;
  description?: string;
  referenceId?: string | null;
  referenceModel?: string | null;
  status?: string;
}) {
  const wallet = await Wallet.findOne({
    $or: [{ user: userId }, { doctorId: userId }],
  });

  if (!wallet) {
    throw new Error('Wallet not found.');
  }

  const currentBalance = wallet.availableBalance ?? wallet.balance ?? 0;
  if (currentBalance < amount) {
    throw new Error('Insufficient wallet balance.');
  }

  const balanceBefore = currentBalance;
  const newAvailable = balanceBefore - amount;
  const newWithdrawn = (wallet.totalWithdrawn || 0) + amount;

  wallet.availableBalance = newAvailable;
  wallet.balance = newAvailable;
  wallet.totalWithdrawn = newWithdrawn;
  await wallet.save();

  await User.findByIdAndUpdate(userId, {
    walletBalance: newAvailable,
  });

  const transaction = await Transaction.create({
    wallet: wallet._id,
    user: userId,
    doctorId: userId,
    type,
    transactionType: 'Debit',
    direction: 'debit',
    amount,
    balanceBefore,
    balanceAfter: newAvailable,
    status,
    description,
    title: description || type,
    referenceId: referenceId || undefined,
    referenceModel: referenceModel || undefined,
  });

  return { wallet, transaction };
}
