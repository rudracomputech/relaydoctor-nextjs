import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import WithdrawalRequest from '@/models/WithdrawalRequest';
import Wallet from '@/models/Wallet';
import User from '@/models/User';
import Transaction from '@/models/Transaction';
import Notification from '@/models/Notification';

export async function PATCH(req: Request, context: any) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = typeof context?.params?.then === 'function' ? await context.params : context?.params;
    const { id } = params;

    const body = await req.json();
    const { status, adminNote } = body;

    if (!status || !['pending', 'approved', 'paid', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    await connectToDatabase();
    const withdrawal = await WithdrawalRequest.findById(id);
    if (!withdrawal) {
      return NextResponse.json({ error: 'Withdrawal request not found' }, { status: 404 });
    }

    const previousStatus = withdrawal.status;
    withdrawal.status = status;
    if (adminNote) withdrawal.adminNote = adminNote;
    if (status === 'paid') withdrawal.processedAt = new Date();
    await withdrawal.save();

    // If rejected, refund the deducted amount back to doctor's wallet
    if (status === 'rejected' && previousStatus !== 'rejected') {
      await Wallet.findOneAndUpdate(
        { doctorId: withdrawal.doctorId },
        {
          $inc: { balance: withdrawal.amount, totalWithdrawn: -withdrawal.amount },
        }
      );
      await User.findByIdAndUpdate(withdrawal.doctorId, {
        $inc: { walletBalance: withdrawal.amount },
      });

      await Transaction.create({
        doctorId: withdrawal.doctorId,
        type: 'withdrawal',
        amount: withdrawal.amount,
        direction: 'credit',
        title: 'Withdrawal Refunded',
        description: `Refund for rejected withdrawal: ${adminNote || 'Bank details mismatch'}`,
        referenceId: withdrawal._id.toString(),
        status: 'failed',
      });

      await Notification.create({
        doctorId: withdrawal.doctorId,
        title: 'Withdrawal Rejected',
        message: `Your withdrawal request of ₹${withdrawal.amount} was rejected and refunded. Reason: ${adminNote || 'Contact support'}`,
        type: 'system',
        isRead: false,
      });
    } else if (status === 'paid') {
      // Notify doctor that funds have reached their bank account
      await Notification.create({
        doctorId: withdrawal.doctorId,
        title: 'Withdrawal Paid',
        message: `₹${withdrawal.amount} has been successfully disbursed to ${withdrawal.bankName} (${withdrawal.accountNumber}).`,
        type: 'payment_credited',
        isRead: false,
      });
    }

    return NextResponse.json({ success: true, data: withdrawal });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
