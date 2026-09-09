import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import bcrypt from 'bcryptjs'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import User from '@/models/User'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .lean()

    const formattedUsers = users.map((u: any) => ({
      ...u,
      _id: u._id.toString(),
      permissions: u.permissions || (u.role === 'admin' ? ['admin:all'] : []),
    }))

    return NextResponse.json({ success: true, data: formattedUsers })
  } catch (error: any) {
    console.error('Admin GET Users Error:', error)
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
    const { name, email, password, phone, role, permissions, isVerified, isBlocked } = body

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
    }

    await connectToDatabase()

    const existing = await User.findOne({ email: email.toLowerCase().trim() })
    if (existing) {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password || 'relay12345', 10)

    const userRole = role || 'user'
    const defaultPermissions =
      userRole === 'admin'
        ? ['admin:all', 'manage:doctors', 'manage:patients', 'manage:subscriptions', 'manage:coupons', 'manage:users']
        : permissions || []

    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone || '',
      mobile: phone || '',
      role: userRole,
      userRole: ['admin', 'doctor', 'user'].includes(userRole) ? userRole : 'user',
      permissions: permissions && permissions.length > 0 ? permissions : defaultPermissions,
      isVerified: isVerified !== undefined ? Boolean(isVerified) : true,
      verified: isVerified !== undefined ? Boolean(isVerified) : true,
      isBlocked: Boolean(isBlocked),
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
    })

    const result = newUser.toObject()
    delete result.password

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        _id: result._id.toString(),
      },
    })
  } catch (error: any) {
    console.error('Admin POST User Error:', error)
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}
