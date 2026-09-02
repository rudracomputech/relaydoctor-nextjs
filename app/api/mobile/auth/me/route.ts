import { NextResponse } from 'next/server';
import { getAuthenticatedDoctor } from '@/lib/jwt';
import Referral from '@/models/Referral';
import Wallet from '@/models/Wallet';
import DoctorSubscription from '@/models/DoctorSubscription';

export async function GET(req: Request) {
  try {
    const doctor = await getAuthenticatedDoctor(req);
    if (!doctor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch live counts for Doctor Dashboard (Matching Figma center screen)
    const incomingReferralsCount = await Referral.countDocuments({
      receivingDoctorId: doctor._id,
      status: { $in: ['pending', 'in_progress'] },
    });

    const outgoingReferralsCount = await Referral.countDocuments({
      referringDoctorId: doctor._id,
    });

    const wallet = await Wallet.findOne({ doctorId: doctor._id });
    const subscription = await DoctorSubscription.findOne({
      doctorId: doctor._id,
      status: 'active',
    }).populate('planId');

    return NextResponse.json({
      success: true,
      doctor: {
        id: doctor._id.toString(),
        name: doctor.name,
        email: doctor.email,
        phone: doctor.phone,
        specialization: doctor.specialization,
        hospital: doctor.hospital,
        experienceYears: doctor.experienceYears,
        rating: doctor.rating,
        reviewCount: doctor.reviewCount,
        avatar: doctor.avatar,
        bio: doctor.bio,
        consultationFee: doctor.consultationFee,
        walletBalance: wallet ? wallet.balance : doctor.walletBalance,
        totalEarnings: wallet ? wallet.totalEarnings : doctor.totalEarnings,
      },
      dashboardStats: {
        referralTickets: incomingReferralsCount,
        outgoingReferrals: outgoingReferralsCount,
        hasActiveSubscription: !!subscription,
        subscriptionPlan: subscription ? (subscription.planId as any)?.name : null,
      },
    });
  } catch (error: any) {
    console.error('Mobile /me error:', error);
    return NextResponse.json({ error: 'Server error: ' + error.message }, { status: 500 });
  }
}
