import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import DoctorSubscription from '@/models/DoctorSubscription';
import { getAuthenticatedDoctor } from '@/lib/jwt';

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const doctor = await getAuthenticatedDoctor(req);
    if (!doctor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscription = await DoctorSubscription.findOne({
      doctorId: doctor._id,
      status: 'active',
    })
      .populate('planId')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      hasActivePlan: !!subscription,
      data: subscription,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
