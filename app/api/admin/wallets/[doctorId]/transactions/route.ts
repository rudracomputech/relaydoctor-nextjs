import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import User from '@/models/User';

export async function GET(req: Request, context: any) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = typeof context?.params?.then === 'function' ? await context.params : context?.params;
    const { doctorId } = params;

    await connectToDatabase();

    const doctor = await User.findById(doctorId).select('name email specialization avatar');
    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }

    const transactions = await Transaction.find({
      $or: [{ doctorId }, { user: doctorId }],
    })
      .sort({ createdAt: -1 })
      .lean();

    const formatted = transactions.map((t: any) => ({
      ...t,
      _id: t._id.toString(),
      createdAt: t.createdAt ? new Date(t.createdAt).toISOString() : '',
    }));

    return NextResponse.json({
      success: true,
      data: {
        doctor,
        transactions: formatted,
      },
    });
  } catch (error: any) {
    console.error('Admin Doctor Transactions Error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
