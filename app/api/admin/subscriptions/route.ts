import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import SubscriptionPlan from '@/models/SubscriptionPlan'
import DoctorSubscription from '@/models/DoctorSubscription'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    const [plans, doctorSubscriptions] = await Promise.all([
      SubscriptionPlan.find().sort({ priceMonthly: 1 }).lean(),
      DoctorSubscription.find()
        .populate('doctorId', 'name specialization hospital email')
        .populate('planId', 'name priceMonthly priceAnnually')
        .sort({ createdAt: -1 })
        .lean(),
    ])

    const formattedPlans = plans.map((p: any) => ({
      ...p,
      _id: p._id.toString(),
    }))

    const formattedSubs = doctorSubscriptions.map((s: any) => ({
      ...s,
      _id: s._id.toString(),
    }))

    return NextResponse.json({
      success: true,
      data: {
        plans: formattedPlans,
        doctorSubscriptions: formattedSubs,
      },
    })
  } catch (error: any) {
    console.error('Admin GET Subscriptions Error:', error)
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
      name,
      tagline,
      badge,
      priceMonthly,
      priceAnnually,
      annualSavingsText,
      features,
      isPopular,
      isActive,
    } = body

    if (!name || priceMonthly === undefined || priceAnnually === undefined) {
      return NextResponse.json(
        { error: 'Plan name, monthly price, and annual price are required' },
        { status: 400 }
      )
    }

    await connectToDatabase()

    const newPlan = await SubscriptionPlan.create({
      name: name.trim(),
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      tagline: tagline || 'Better care with priority access',
      badge: badge || '',
      priceMonthly: Number(priceMonthly),
      priceAnnually: Number(priceAnnually),
      price: Number(priceMonthly),
      annualSavingsText: annualSavingsText || '',
      features: Array.isArray(features) ? features : (features || '').split('\n').filter(Boolean),
      isPopular: Boolean(isPopular),
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    })

    return NextResponse.json({
      success: true,
      data: {
        ...newPlan.toObject(),
        _id: newPlan._id.toString(),
      },
    })
  } catch (error: any) {
    console.error('Admin POST SubscriptionPlan Error:', error)
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}
