import { NextResponse } from 'next/server';
import { authenticateRequest, jsonError, jsonSuccess } from '@/lib/auth-middleware';
import SubscriptionPlan from '@/models/SubscriptionPlan';
import Coupon from '@/models/Coupon';
import Payment from '@/models/Payment';
import Subscription from '@/models/Subscription';
import Razorpay from 'razorpay';

export async function POST(req: Request) {
  try {
    const { user, errorResponse } = await authenticateRequest(req);
    if (errorResponse) return errorResponse;

    const { planId, couponCode, action } = await req.json();
    const userId = user!._id;

    const activeSubscription = await Subscription.findOne({
      user: userId,
      status: 'Active',
      expiryDate: { $gt: new Date() },
    }).populate('plan');

    if (activeSubscription && action !== 'renew') {
      return NextResponse.json(
        {
          success: false,
          message: 'You already have an active subscription.',
          data: {
            subscriptionId: activeSubscription._id,
            plan: (activeSubscription.plan as any)?.name,
            expiryDate: activeSubscription.expiryDate,
          },
        },
        { status: 400 }
      );
    }

    if (!planId) {
      return jsonError('Plan ID is required.', 400);
    }

    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) {
      return jsonError('Subscription plan not found.', 404);
    }

    let finalAmount = plan.price ?? plan.priceMonthly ?? 999;
    let coupon: any = null;
    let discount = 0;

    if (couponCode) {
      coupon = await Coupon.findOne({
        code: couponCode.toUpperCase().trim(),
        isActive: true,
      });

      if (!coupon) {
        return jsonError('Invalid coupon.', 400);
      }

      const discountType = (coupon as any).discountType || (coupon as any).type || 'Flat';
      const discountVal = (coupon as any).discountValue ?? (coupon as any).value ?? 0;

      if (discountType === 'Flat' || discountType === 'fixed') {
        discount = discountVal;
      } else {
        discount = (finalAmount * discountVal) / 100;
        const maxDiscount = (coupon as any).maxDiscount || (coupon as any).maximumDiscountAmount;
        if (maxDiscount && discount > maxDiscount) {
          discount = maxDiscount;
        }
      }

      if (discount > finalAmount) {
        discount = finalAmount;
      }

      finalAmount = Math.max(finalAmount - discount, 0);
    }

    let orderId = `order_${Date.now()}`;
    const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder';
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (keySecret && keyId && !keyId.includes('placeholder')) {
      const razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });

      const order = await razorpay.orders.create({
        amount: Math.round(finalAmount * 100),
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
      });
      orderId = order.id;
    }

    const payment = await Payment.create({
      user: userId,
      plan: plan._id,
      coupon: coupon ? coupon._id : null,
      amount: finalAmount,
      currency: 'INR',
      razorpayOrderId: orderId,
      status: 'Pending',
      purchaseType: action === 'renew' ? 'RENEW' : 'NEW',
    });

    const data = {
      paymentId: payment._id,
      key: keyId,
      orderId,
      amount: Math.round(finalAmount * 100),
      currency: 'INR',
      planName: plan.name,
      originalAmount: plan.price ?? plan.priceMonthly,
      discount,
      finalAmount,
    };

    return jsonSuccess(data, 'Order created successfully.', 201, { data });
  } catch (error: any) {
    console.error('Create Payment Order Error:', error);
    return jsonError(error?.message || 'Server error', 500);
  }
}
