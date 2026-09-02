import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Referral from '@/models/Referral';
import Wallet from '@/models/Wallet';
import Transaction from '@/models/Transaction';
import Notification from '@/models/Notification';
import User from '@/models/User';
import { getAuthenticatedDoctor } from '@/lib/jwt';

export async function GET(req: Request, context: any) {
  try {
    const params = typeof context?.params?.then === 'function' ? await context.params : context?.params;
    const { id } = params;

    await connectToDatabase();
    const query = id.startsWith('REF-') ? { ticketNumber: id } : { _id: id };

    const referral = await Referral.findOne(query)
      .populate('referringDoctorId', 'name specialization hospital avatar phone')
      .populate('receivingDoctorId', 'name specialization hospital avatar phone');

    if (!referral) {
      return NextResponse.json({ error: 'Referral not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: referral });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, context: any) {
  try {
    const params = typeof context?.params?.then === 'function' ? await context.params : context?.params;
    const { id } = params;

    await connectToDatabase();
    const doctor = await getAuthenticatedDoctor(req);
    const body = await req.json();
    const { status, note } = body;

    if (!status || !['pending', 'accepted', 'declined', 'in_progress', 'completed'].includes(status)) {
      return NextResponse.json({ error: 'Valid status is required' }, { status: 400 });
    }

    const query = id.startsWith('REF-') ? { ticketNumber: id } : { _id: id };
    const referral = await Referral.findOne(query);

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
      note: note || `Status updated from ${oldStatus} to ${status}`,
    });
    await referral.save();

    // If accepted for the first time, credit referral reward (₹500) to referring doctor's wallet
    if (status === 'accepted' && oldStatus !== 'accepted') {
      const bonusAmount = 500;
      await Wallet.findOneAndUpdate(
        { doctorId: referral.referringDoctorId },
        {
          $inc: { balance: bonusAmount, totalEarnings: bonusAmount },
        },
        { upsert: true }
      );
      await User.findByIdAndUpdate(referral.referringDoctorId, {
        $inc: { walletBalance: bonusAmount, totalEarnings: bonusAmount },
      });

      await Transaction.create({
        doctorId: referral.referringDoctorId,
        type: 'referral_bonus',
        amount: bonusAmount,
        direction: 'credit',
        title: 'Referral bonus',
        description: `Bonus for referral ${referral.ticketNumber} (${referral.patientName})`,
        referenceId: referral.ticketNumber,
        status: 'completed',
      });

      // Send notification to referring doctor
      await Notification.create({
        doctorId: referral.referringDoctorId,
        title: 'Referral Accepted',
        message: `Your referral for ${referral.patientName} was accepted! ₹${bonusAmount} credited to your wallet.`,
        type: 'referral_accepted',
        actionData: { referralId: referral._id.toString() },
        isRead: false,
      });
    }

    const updated = await Referral.findById(referral._id)
      .populate('referringDoctorId', 'name specialization hospital avatar')
      .populate('receivingDoctorId', 'name specialization hospital avatar');

    return NextResponse.json({
      success: true,
      message: `Referral status updated to ${status}`,
      data: updated,
    });
  } catch (error: any) {
    console.error('Referral PATCH error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
