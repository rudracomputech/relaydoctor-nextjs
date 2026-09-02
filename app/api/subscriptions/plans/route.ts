import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import SubscriptionPlan from '@/models/SubscriptionPlan';
import { jsonError, jsonSuccess } from '@/lib/auth-middleware';

export async function GET() {
  try {
    await connectToDatabase();

    const plans = await SubscriptionPlan.find({ isActive: true }).sort({
      priceMonthly: 1,
      price: 1,
    });

    const formattedPlans = plans.map((p: any) => ({
      _id: p._id.toString(),
      name: p.name,
      slug: p.slug || p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      price: p.price ?? p.priceMonthly,
      priceMonthly: p.priceMonthly,
      priceAnnually: p.priceAnnually,
      duration: p.duration || 1,
      durationType: p.durationType || 'Month',
      description: p.description || p.tagline || '',
      features: p.features || [],
      isPopular: p.isPopular || false,
      isActive: p.isActive,
    }));

    return jsonSuccess(formattedPlans, 'Subscription plans fetched successfully', 200, {
      total: formattedPlans.length,
      data: formattedPlans,
    });
  } catch (error: any) {
    console.error('Get Subscription Plans Error:', error);
    return jsonError(error?.message || 'Server error', 500);
  }
}
