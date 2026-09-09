import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import SubscriptionPlan from '@/models/SubscriptionPlan'

export async function GET(req: Request, context: any) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const params = await context.params
    const { id } = params

    await connectToDatabase()
    const plan = await SubscriptionPlan.findById(id).lean()
    if (!plan) {
      return NextResponse.json({ error: 'Subscription plan not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
        ...plan,
        _id: plan._id.toString(),
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
    const plan = await SubscriptionPlan.findById(id)
    if (!plan) {
      return NextResponse.json({ error: 'Subscription plan not found' }, { status: 404 })
    }

    if (body.name) {
      plan.name = body.name.trim()
      plan.slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    }
    if (body.tagline !== undefined) plan.tagline = body.tagline
    if (body.badge !== undefined) plan.badge = body.badge
    if (body.priceMonthly !== undefined) {
      plan.priceMonthly = Number(body.priceMonthly)
      plan.price = Number(body.priceMonthly)
    }
    if (body.priceAnnually !== undefined) plan.priceAnnually = Number(body.priceAnnually)
    if (body.annualSavingsText !== undefined) plan.annualSavingsText = body.annualSavingsText
    if (body.features !== undefined) {
      plan.features = Array.isArray(body.features)
        ? body.features
        : (body.features || '').split('\n').filter(Boolean)
    }
    if (body.isPopular !== undefined) plan.isPopular = Boolean(body.isPopular)
    if (body.isActive !== undefined) plan.isActive = Boolean(body.isActive)

    await plan.save()

    return NextResponse.json({
      success: true,
      data: {
        ...plan.toObject(),
        _id: plan._id.toString(),
      },
    })
  } catch (error: any) {
    console.error('Admin PUT SubscriptionPlan Error:', error)
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
    const deleted = await SubscriptionPlan.findByIdAndDelete(id)
    if (!deleted) {
      return NextResponse.json({ error: 'Subscription plan not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Subscription plan deleted successfully' })
  } catch (error: any) {
    console.error('Admin DELETE SubscriptionPlan Error:', error)
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}
