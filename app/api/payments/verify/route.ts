import { NextResponse } from 'next/server';
import { authenticateRequest, jsonError, jsonSuccess } from '@/lib/auth-middleware';
import crypto from 'crypto';
import Payment from '@/models/Payment';
import Coupon from '@/models/Coupon';
import SubscriptionPlan from '@/models/SubscriptionPlan';
import Subscription from '@/models/Subscription';

export async function POST(req: Request) {
  try {
    const { user, errorResponse } = await authenticateRequest(req);
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const orderId = body.razorpay_order_id || body.razorpayOrderId;
    const paymentId = body.razorpay_payment_id || body.razorpayPaymentId;
    const signature = body.razorpay_signature || body.razorpaySignature;

    if (!orderId || !paymentId) {
      return jsonError('Missing payment details.', 400);
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (keySecret && signature) {
      const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      if (generatedSignature !== signature) {
        return jsonError('Payment verification failed.', 400);
      }
    }

    const payment = await Payment.findOne({ razorpayOrderId: orderId });
    if (!payment) {
      return jsonError('Payment not found.', 404);
    }

    if (payment.status === 'Success') {
      return jsonSuccess(null, 'Payment already verified.', 200);
    }

    payment.status = 'Success';
    payment.razorpayPaymentId = paymentId;
    payment.razorpaySignature = signature || '';
    await payment.save();

    if (payment.coupon) {
      await Coupon.findByIdAndUpdate(payment.coupon, {
        $inc: { usedCount: 1 },
      });
    }

    const plan = await SubscriptionPlan.findById(payment.plan);
    if (!plan) {
      return jsonError('Subscription plan not found.', 404);
    }

    const duration = plan.duration || 1;
    const durationType = plan.durationType || 'Month';

    if (payment.purchaseType === 'RENEW') {
      const existingSub = await Subscription.findOne({
        user: payment.user,
        status: 'Active',
      });

      if (existingSub) {
        let expiryDate = new Date(existingSub.expiryDate);
        if (durationType === 'Day') expiryDate.setDate(expiryDate.getDate() + duration);
        else if (durationType === 'Month') expiryDate.setMonth(expiryDate.getMonth() + duration);
        else if (durationType === 'Year') expiryDate.setFullYear(expiryDate.getFullYear() + duration);

        existingSub.expiryDate = expiryDate;
        existingSub.payment = payment._id;
        await existingSub.save();

        return jsonSuccess({ expiryDate }, 'Subscription renewed successfully.', 200, {
          data: { expiryDate },
        });
      }
    }

    const startDate = new Date();
    const expiryDate = new Date(startDate);
    if (durationType === 'Day') expiryDate.setDate(expiryDate.getDate() + duration);
    else if (durationType === 'Month') expiryDate.setMonth(expiryDate.getMonth() + duration);
    else if (durationType === 'Year') expiryDate.setFullYear(expiryDate.getFullYear() + duration);

    await Subscription.create({
      user: payment.user,
      plan: payment.plan,
      payment: payment._id,
      startDate,
      expiryDate,
      status: 'Active',
    });

    return jsonSuccess({ expiryDate }, 'Payment verified successfully.', 200);
  } catch (error: any) {
    console.error('Verify Payment Error:', error);
    return jsonError(error?.message || 'Server error', 500);
  }
}
