import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import Coupon from '@/models/Coupon'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()
    const coupons = await Coupon.find().sort({ createdAt: -1 }).lean()

    const formattedCoupons = coupons.map((c: any) => ({
      ...c,
      _id: c._id.toString(),
    }))

    return NextResponse.json({ success: true, data: formattedCoupons })
  } catch (error: any) {
    console.error('Admin GET Coupons Error:', error)
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscount,
      usageLimit,
      validUntil,
      isActive,
    } = body

    if (!code || discountValue === undefined) {
      return NextResponse.json(
        { error: 'Coupon code and discount value are required' },
        { status: 400 }
      )
    }

    await connectToDatabase()

    const existing = await Coupon.findOne({ code: code.toUpperCase().trim() })
    if (existing) {
      return NextResponse.json({ error: 'A coupon with this code already exists' }, { status: 409 })
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase().trim(),
      description: description || '',
      discountType: discountType || 'flat',
      discountValue: Number(discountValue),
      minOrderAmount: minOrderAmount ? Number(minOrderAmount) : 0,
      minimumAmount: minOrderAmount ? Number(minOrderAmount) : 0,
      maxDiscount: maxDiscount ? Number(maxDiscount) : 0,
      usageLimit: usageLimit ? Number(usageLimit) : 100,
      maxUsageLimit: usageLimit ? Number(usageLimit) : 100,
      usageCount: 0,
      usedCount: 0,
      validUntil: validUntil ? new Date(validUntil) : undefined,
      expiryDate: validUntil ? new Date(validUntil) : undefined,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    })

    const couponObj = (coupon as any).toObject ? (coupon as any).toObject() : coupon

    return NextResponse.json({
      success: true,
      data: {
        ...couponObj,
        _id: couponObj._id.toString(),
      },
    }, { status: 201 })
  } catch (error: any) {
    console.error('Admin POST Coupon Error:', error)
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}
