import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import Wallet from '@/models/Wallet';
import WithdrawalRequest from '@/models/WithdrawalRequest';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Fetch all doctors
    const doctors = await User.find({
      $or: [{ role: 'doctor' }, { userRole: 'doctor' }],
    })
      .select('name email phone specialization speciality avatar profileImage city hospital walletBalance totalEarnings isVerified')
      .sort({ name: 1 })
      .lean();

    // Fetch all existing wallets
    const wallets = await Wallet.find().lean();
    const walletMap: Record<string, any> = {};
    wallets.forEach((w: any) => {
      const docId = w.doctorId?.toString() || w.user?.toString();
      if (docId) {
        walletMap[docId] = w;
      }
    });

    // Fetch pending withdrawal counts
    const pendingWithdrawals = await WithdrawalRequest.find({
      status: { $in: ['Pending', 'pending', 'Under Review'] },
    }).lean();

    const pendingMap: Record<string, number> = {};
    pendingWithdrawals.forEach((pw: any) => {
      const docId = pw.doctorId?.toString() || pw.userId?.toString();
      if (docId) {
        pendingMap[docId] = (pendingMap[docId] || 0) + (pw.amount || 0);
      }
    });

    let totalCirculationBalance = 0;
    let totalDoctorEarnings = 0;
    let totalWithdrawn = 0;

    const doctorWallets = doctors.map((doc: any) => {
      const docId = doc._id.toString();
      const w = walletMap[docId];

      const balance = w ? (w.availableBalance ?? w.balance ?? 0) : (doc.walletBalance ?? 0);
      const earnings = w ? (w.totalEarnings ?? 0) : (doc.totalEarnings ?? 0);
      const withdrawn = w ? (w.totalWithdrawn ?? 0) : 0;
      const pendingPayout = pendingMap[docId] || 0;

      totalCirculationBalance += balance;
      totalDoctorEarnings += earnings;
      totalWithdrawn += withdrawn;

      return {
        _id: w?._id ? w._id.toString() : `wallet_${docId}`,
        doctorId: docId,
        doctor: {
          _id: docId,
          name: doc.name,
          email: doc.email,
          phone: doc.phone,
          specialization: doc.specialization || doc.speciality || 'General',
          avatar: doc.avatar || doc.profileImage || '',
          city: doc.city || '',
          hospital: doc.hospital || '',
          isVerified: Boolean(doc.isVerified),
        },
        balance,
        availableBalance: balance,
        pendingBalance: pendingPayout,
        totalEarnings: earnings,
        totalWithdrawn: withdrawn,
        currency: w?.currency || 'INR',
        isActive: w ? w.isActive ?? true : true,
        updatedAt: w?.updatedAt ? new Date(w.updatedAt).toISOString() : '',
      };
    });

    // Sort by balance desc
    doctorWallets.sort((a, b) => b.balance - a.balance);

    return NextResponse.json({
      success: true,
      data: {
        wallets: doctorWallets,
        stats: {
          totalCirculationBalance,
          totalDoctorEarnings,
          totalWithdrawn,
          totalDoctorsCount: doctors.length,
          pendingPayoutsTotal: Object.values(pendingMap).reduce((a, b) => a + b, 0),
          pendingPayoutsCount: pendingWithdrawals.length,
        },
      },
    });
  } catch (error: any) {
    console.error('Admin GET Wallets Error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
