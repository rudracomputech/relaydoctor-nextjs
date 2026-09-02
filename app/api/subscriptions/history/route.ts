import { NextResponse } from 'next/server';
import { authenticateRequest, jsonError, jsonSuccess } from '@/lib/auth-middleware';
import Subscription from '@/models/Subscription';
import DoctorSubscription from '@/models/DoctorSubscription';

export async function GET(req: Request) {
  try {
    const { user, errorResponse } = await authenticateRequest(req);
    if (errorResponse) return errorResponse;

    const userId = user!._id;

    let subscriptions: any[] = await Subscription.find({ user: userId })
      .populate('plan', 'name price duration durationType')
      .populate('payment', 'amount status currency razorpayPaymentId createdAt')
      .sort({ createdAt: -1 });

    if (subscriptions.length === 0) {
      const docSubs: any[] = await DoctorSubscription.find({ doctorId: userId })
        .populate('planId', 'name price duration durationType')
        .sort({ createdAt: -1 });

      subscriptions = docSubs.map((s: any) => ({
        _id: s._id,
        user: s.doctorId,
        plan: s.planId,
        startDate: s.startDate,
        expiryDate: s.endDate,
        status: s.status === 'active' ? 'Active' : s.status,
        createdAt: s.createdAt,
      }));
    }

    return jsonSuccess(subscriptions, 'Subscription history fetched successfully.', 200, {
      total: subscriptions.length,
      data: subscriptions,
    });
  } catch (error: any) {
    console.error('Subscription History Error:', error);
    return jsonError(error?.message || 'Server error', 500);
  }
}
