import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import Referral from '@/models/Referral';
import Wallet from '@/models/Wallet';
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
    const { status, note } = body;

    await connectToDatabase();
    const referral = await Referral.findById(id);
    if (!referral) {
      return NextResponse.json({ error: 'Referral not found' }, { status: 404 });
    }

    const oldStatus = referral.status;
    referral.status = status;
    if (!referral.statusHistory) {
      referral.statusHistory = [];
    }
    referral.statusHistory.push({
      status,
      changedAt: new Date(),
      note: note || `Admin updated status to ${status}`,
    });
    await referral.save();

    // If marked accepted by admin, credit referral reward to referring doctor if not already credited
    if (status === 'accepted' && oldStatus !== 'accepted') {
      const bonusAmount = 500;
      await Wallet.findOneAndUpdate(
        { doctorId: referral.referringDoctorId },
        { $inc: { balance: bonusAmount, totalEarnings: bonusAmount } },
        { upsert: true }
      );
      await Transaction.create({
        doctorId: referral.referringDoctorId,
        type: 'referral_bonus',
        amount: bonusAmount,
        direction: 'credit',
        title: 'Referral bonus (Admin Verified)',
        description: `Bonus for ${referral.ticketNumber}`,
        referenceId: referral.ticketNumber,
        status: 'completed',
      });
    }

    return NextResponse.json({ success: true, data: referral });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
