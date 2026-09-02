import { NextResponse } from 'next/server';
import { authenticateRequest, jsonError, jsonSuccess } from '@/lib/auth-middleware';
import Subscription from '@/models/Subscription';
import DoctorSubscription from '@/models/DoctorSubscription';

export async function GET(req: Request) {
  try {
    const { user, errorResponse } = await authenticateRequest(req);
    if (errorResponse) return errorResponse;

    const userId = user!._id;

    // Check in Subscription model
    let sub: any = await Subscription.findOne({
      user: userId,
      status: 'Active',
      expiryDate: { $gt: new Date() },
    }).populate('plan');

    // Fallback to DoctorSubscription if seeded in DoctorSubscription
    if (!sub) {
      const docSub: any = await DoctorSubscription.findOne({
        doctorId: userId,
        status: 'active',
      }).populate('planId');

      if (docSub) {
        const remainingDays = Math.max(
          Math.ceil((new Date(docSub.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
          0
        );

        return jsonSuccess(
          {
            subscriptionId: docSub._id,
            plan: docSub.planId,
            startDate: docSub.startDate,
            expiryDate: docSub.endDate,
            remainingDays,
            status: docSub.status,
          },
          'Subscription fetched successfully.',
          200,
          {
            data: {
              subscriptionId: docSub._id,
              plan: docSub.planId,
              startDate: docSub.startDate,
              expiryDate: docSub.endDate,
              remainingDays,
              status: docSub.status,
            },
          }
        );
      }
    }

    if (!sub) {
      return jsonError('No active subscription found.', 404);
    }

    const remainingDays = Math.max(
      Math.ceil((new Date(sub.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      0
    );

    const data = {
      subscriptionId: sub._id,
      plan: sub.plan,
      startDate: sub.startDate,
      expiryDate: sub.expiryDate,
      remainingDays,
      status: sub.status,
    };

    return jsonSuccess(data, 'Subscription fetched successfully.', 200, { data });
  } catch (error: any) {
    console.error('Get My Subscription Error:', error);
    return jsonError(error?.message || 'Server error', 500);
  }
}
