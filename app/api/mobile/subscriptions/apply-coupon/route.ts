import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Coupon from '@/models/Coupon';

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { code, amount } = body;

    if (!code || amount === undefined) {
      return NextResponse.json({ error: 'Coupon code and order amount are required' }, { status: 400 });
    }

    const coupon = await Coupon.findOne({
      code: code.toUpperCase().trim(),
      isActive: true,
    });

    if (!coupon) {
      return NextResponse.json({ error: 'Invalid or expired coupon code' }, { status: 404 });
    }

    if (coupon.validUntil && new Date() > coupon.validUntil) {
      return NextResponse.json({ error: 'This coupon has expired' }, { status: 400 });
    }

    const orderAmount = Number(amount);
    const minOrder = coupon.minOrderAmount ?? coupon.minimumAmount ?? 0;
    if (minOrder > 0 && orderAmount < minOrder) {
      return NextResponse.json(
        { error: `Minimum order amount of ₹${minOrder} required for this coupon` },
        { status: 400 }
      );
    }

    let discount = 0;
    if (coupon.discountType === 'flat') {
      discount = Math.min(coupon.discountValue, orderAmount);
    } else {
      discount = Math.round((orderAmount * coupon.discountValue) / 100);
    }

    const finalAmount = Math.max(0, orderAmount - discount);

    return NextResponse.json({
      success: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        description: coupon.description,
      },
      originalAmount: orderAmount,
      discountAmount: discount,
      finalAmount,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
