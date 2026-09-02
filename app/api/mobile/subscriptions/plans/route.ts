import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import SubscriptionPlan from '@/models/SubscriptionPlan';

export async function GET() {
  try {
    await connectToDatabase();
    const plans = await SubscriptionPlan.find({ isActive: true }).sort({ priceMonthly: 1 });

    return NextResponse.json({
      success: true,
      data: plans,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
