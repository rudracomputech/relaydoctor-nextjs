import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import bcrypt from 'bcryptjs'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import User from '@/models/User'

export async function GET(req: Request, context: any) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const params = await context.params
    const { id } = params

    await connectToDatabase()
    const user = await User.findById(id).select('-password').lean()
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
        ...user,
        _id: user._id.toString(),
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
    const user = await User.findById(id)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (body.name) user.name = body.name.trim()
    if (body.email) user.email = body.email.toLowerCase().trim()
    if (body.phone !== undefined) {
      user.phone = body.phone
      user.mobile = body.phone
    }
    if (body.role) {
      user.role = body.role
      if (['admin', 'doctor', 'user'].includes(body.role)) {
        user.userRole = body.role
      }
    }
    if (body.permissions !== undefined) {
      user.permissions = Array.isArray(body.permissions) ? body.permissions : []
    }
    if (body.isVerified !== undefined) {
      user.isVerified = Boolean(body.isVerified)
      user.verified = Boolean(body.isVerified)
    }
    if (body.isBlocked !== undefined) {
      user.isBlocked = Boolean(body.isBlocked)
    }
    if (body.password) {
      user.password = await bcrypt.hash(body.password, 10)
    }

    await user.save()

    const updatedUser = user.toObject()
    delete updatedUser.password

    return NextResponse.json({
      success: true,
      data: {
        ...updatedUser,
        _id: updatedUser._id.toString(),
      },
    })
  } catch (error: any) {
    console.error('Admin PUT User Error:', error)
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

    // Prevent deleting own account
    if (session.user && (session.user as any).id === id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
    }

    await connectToDatabase()
    const deleted = await User.findByIdAndDelete(id)
    if (!deleted) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'User deleted successfully' })
  } catch (error: any) {
    console.error('Admin DELETE User Error:', error)
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}
