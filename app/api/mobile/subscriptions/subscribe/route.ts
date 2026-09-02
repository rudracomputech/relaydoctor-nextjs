import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import DoctorSubscription from '@/models/DoctorSubscription';
import SubscriptionPlan from '@/models/SubscriptionPlan';
import Transaction from '@/models/Transaction';
import { getAuthenticatedDoctor } from '@/lib/jwt';

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const doctor = await getAuthenticatedDoctor(req);
    if (!doctor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { planId, billingCycle = 'annually', couponCode, paymentMethod = 'UPI' } = body;

    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    const price = billingCycle === 'annually' ? plan.priceAnnually : plan.priceMonthly;
    const durationDays = billingCycle === 'annually' ? 365 : 30;

    const subscription = await DoctorSubscription.create({
      doctorId: doctor._id,
      planId: plan._id,
      billingCycle,
      amount: price,
      couponCode: couponCode || '',
      paymentMethod,
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000),
      autoRenew: true,
    });

    // Record transaction
    await Transaction.create({
      doctorId: doctor._id,
      type: 'subscription',
      amount: price,
      direction: 'debit',
      title: `${plan.name} (${billingCycle})`,
      description: `Subscription activated via ${paymentMethod}`,
      referenceId: subscription._id.toString(),
      status: 'completed',
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription activated successfully',
      data: subscription,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
