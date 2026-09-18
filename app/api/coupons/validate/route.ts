import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Coupon from '@/models/Coupon';
import SubscriptionPlan from '@/models/SubscriptionPlan';
import { jsonError, jsonSuccess } from '@/lib/auth-middleware';

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { code, planId, doctorId, userId } = body;

    if (!code || !planId) {
      return jsonError('Coupon code and Plan ID are required.', 400);
    }

    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) {
      return jsonError('Subscription plan not found.', 404);
    }

    const coupon = await Coupon.findOne({
      code: code.toUpperCase().trim(),
      isActive: true,
    });

    if (!coupon) {
      return jsonError('Invalid coupon.', 404);
    }

    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return jsonError('Coupon has expired.', 400);
    }

    if (coupon.usageLimit && (coupon.usedCount || 0) >= coupon.usageLimit) {
      return jsonError('Coupon usage limit exceeded.', 400);
    }

    const targetDocId = doctorId || userId;
    if (
      (coupon.applicableTo === 'specific' || (coupon.assignedDoctors && coupon.assignedDoctors.length > 0)) &&
      targetDocId
    ) {
      const isAssigned = coupon.assignedDoctors?.some(
        (id: any) => id.toString() === targetDocId.toString()
      );
      if (!isAssigned) {
        return jsonError('This promotional coupon is not valid for your doctor account.', 403);
      }
    }

    const planPrice = plan.price ?? plan.priceMonthly ?? 0;
    let discount = 0;

    const discountType = (coupon as any).discountType || (coupon as any).type || 'Flat';
    const discountVal = (coupon as any).discountValue ?? (coupon as any).value ?? 0;

    if (discountType === 'Flat' || discountType === 'fixed') {
      discount = discountVal;
    } else {
      discount = (planPrice * discountVal) / 100;
      const maxDiscount = (coupon as any).maxDiscount || (coupon as any).maximumDiscountAmount;
      if (maxDiscount && discount > maxDiscount) {
        discount = maxDiscount;
      }
    }

    if (discount > planPrice) {
      discount = planPrice;
    }

    const finalAmount = Math.max(planPrice - discount, 0);

    const data = {
      couponId: coupon._id,
      couponCode: coupon.code,
      planPrice,
      discount,
      finalAmount,
    };

    return jsonSuccess(data, 'Coupon applied successfully.', 200, { data });
  } catch (error: any) {
    console.error('Validate Coupon Error:', error);
    return jsonError(error?.message || 'Server error', 500);
  }
}
