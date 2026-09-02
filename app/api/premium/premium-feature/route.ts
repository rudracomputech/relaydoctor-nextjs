import { NextResponse } from 'next/server';
import { authenticateRequest, jsonError, jsonSuccess } from '@/lib/auth-middleware';
import Subscription from '@/models/Subscription';
import DoctorSubscription from '@/models/DoctorSubscription';

export async function GET(req: Request) {
  try {
    const { user, errorResponse } = await authenticateRequest(req);
    if (errorResponse) return errorResponse;

    const userId = user!._id;

    // Check active subscription
    let subscription: any = await Subscription.findOne({
      user: userId,
      status: 'Active',
      expiryDate: { $gt: new Date() },
    }).populate('plan');

    if (!subscription) {
      const docSub: any = await DoctorSubscription.findOne({
        doctorId: userId,
        status: 'active',
      }).populate('planId');

      if (docSub) {
        subscription = {
          _id: docSub._id,
          plan: docSub.planId,
          expiryDate: docSub.endDate,
          status: 'Active',
        };
      }
    }

    if (!subscription) {
      return jsonError('Active subscription required.', 403);
    }

    return jsonSuccess({ subscription }, 'Premium feature unlocked.', 200, { subscription });
  } catch (error: any) {
    console.error('Premium Feature Error:', error);
    return jsonError(error?.message || 'Server error', 500);
  }
}
