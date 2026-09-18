import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import Referral from '@/models/Referral';
import Wallet from '@/models/Wallet';
import Transaction from '@/models/Transaction';
import Notification from '@/models/Notification';
import Setting from '@/models/Setting';
import User from '@/models/User';

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
    if (status === 'accepted' && oldStatus !== 'accepted' && referral.referringDoctorId) {
      let setting = await Setting.findOne();
      if (!setting) {
        setting = { referralRewardType: 'percentage', referralPercentage: 10, referralFlatAmount: 500 } as any;
      }

      let bonusAmount = 500;
      const receivingDoctorId = referral.receivingDoctorId || referral.toDoctor;
      const receivingDoctor = receivingDoctorId ? await User.findById(receivingDoctorId).select('consultationFee') : null;
      const consultationFee = receivingDoctor?.consultationFee || 500;

      if (setting?.referralRewardType === 'percentage') {
        const pct = setting.referralPercentage ?? 10;
        bonusAmount = Math.max(1, Math.round((consultationFee * pct) / 100));
      } else {
        bonusAmount = setting?.referralFlatAmount ?? 500;
      }

      await Wallet.findOneAndUpdate(
        { doctorId: referral.referringDoctorId },
        { $inc: { balance: bonusAmount, availableBalance: bonusAmount, totalEarnings: bonusAmount } },
        { upsert: true }
      );

      await User.findByIdAndUpdate(referral.referringDoctorId, {
        $inc: { walletBalance: bonusAmount, totalEarnings: bonusAmount },
      });

      await Transaction.create({
        doctorId: referral.referringDoctorId,
        user: referral.referringDoctorId,
        type: 'referral_bonus',
        amount: bonusAmount,
        direction: 'credit',
        transactionType: 'Credit',
        title: 'Referral bonus (Admin Verified)',
        description: `Referral bonus (${setting?.referralRewardType === 'percentage' ? `${setting.referralPercentage}%` : 'flat'}) for case ${referral.ticketNumber}`,
        referenceId: referral.ticketNumber,
        status: 'completed',
      });

      await Notification.create({
        doctorId: referral.referringDoctorId,
        title: 'Referral Case Accepted',
        message: `Your referral case ${referral.ticketNumber} was verified. ₹${bonusAmount} credited to your wallet!`,
        type: 'referral_accepted',
        actionData: { referralId: referral._id.toString() },
        isRead: false,
      });
    }

    return NextResponse.json({ success: true, data: referral });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
