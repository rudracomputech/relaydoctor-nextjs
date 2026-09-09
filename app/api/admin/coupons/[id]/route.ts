import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import Coupon from '@/models/Coupon'

export async function GET(req: Request, context: any) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const params = await context.params
    const { id } = params

    await connectToDatabase()
    const coupon = await Coupon.findById(id).lean()
    if (!coupon) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
        ...coupon,
        _id: coupon._id.toString(),
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}

export async function PUT(req: Request, context: any) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const params = await context.params
    const { id } = params
    const body = await req.json()

    await connectToDatabase()
    const coupon = await Coupon.findById(id)
    if (!coupon) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 })
    }

    if (body.code) coupon.code = body.code.toUpperCase().trim()
    if (body.description !== undefined) coupon.description = body.description
    if (body.discountType !== undefined) coupon.discountType = body.discountType
    if (body.discountValue !== undefined) coupon.discountValue = Number(body.discountValue)
    if (body.minOrderAmount !== undefined) {
      coupon.minOrderAmount = Number(body.minOrderAmount)
      coupon.minimumAmount = Number(body.minOrderAmount)
    }
    if (body.maxDiscount !== undefined) coupon.maxDiscount = Number(body.maxDiscount)
    if (body.usageLimit !== undefined) {
      coupon.usageLimit = Number(body.usageLimit)
      coupon.maxUsageLimit = Number(body.usageLimit)
    }
    if (body.validUntil !== undefined) {
      coupon.validUntil = body.validUntil ? new Date(body.validUntil) : undefined
      coupon.expiryDate = body.validUntil ? new Date(body.validUntil) : undefined
    }
    if (body.isActive !== undefined) coupon.isActive = Boolean(body.isActive)

    await coupon.save()

    return NextResponse.json({
      success: true,
      data: {
        ...coupon.toObject(),
        _id: coupon._id.toString(),
      },
    })
  } catch (error: any) {
    console.error('Admin PUT Coupon Error:', error)
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}

export async function DELETE(req: Request, context: any) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const params = await context.params
    const { id } = params

    await connectToDatabase()
    const deleted = await Coupon.findByIdAndDelete(id)
    if (!deleted) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Coupon deleted successfully' })
  } catch (error: any) {
    console.error('Admin DELETE Coupon Error:', error)
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}
