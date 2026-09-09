import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import bcrypt from 'bcryptjs'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import User from '@/models/User'
import Referral from '@/models/Referral'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    const doctors = await User.find({
      $or: [{ role: 'doctor' }, { userRole: 'doctor' }],
    })
      .sort({ createdAt: -1 })
      .lean()

    const doctorsWithStats = await Promise.all(
      doctors.map(async (doc: any) => {
        const [sentReferrals, receivedReferrals] = await Promise.all([
          Referral.countDocuments({ referringDoctorId: doc._id }),
          Referral.countDocuments({ receivingDoctorId: doc._id }),
        ])
        return {
          ...doc,
          _id: doc._id.toString(),
          sentReferrals,
          receivedReferrals,
        }
      })
    )

    return NextResponse.json({ success: true, data: doctorsWithStats })
  } catch (error: any) {
    console.error('Admin GET Doctors Error:', error)
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
      email,
      phone,
      password,
      specialization,
      hospital,
      clinicAddress,
      experienceYears,
      consultationFee,
      isVerified,
      bio,
    } = body

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
    }

    await connectToDatabase()

    const existing = await User.findOne({ email: email.toLowerCase().trim() })
    if (existing) {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password || 'doctor123', 10)

    const newDoctor = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone || '',
      mobile: phone || '',
      role: 'doctor',
      userRole: 'doctor',
      specialization: specialization || 'General Physician',
      speciality: specialization || 'General Physician',
      hospital: hospital || '',
      clinicAddress: clinicAddress || '',
      experienceYears: Number(experienceYears) || 5,
      consultationFee: Number(consultationFee) || 500,
      isVerified: isVerified !== undefined ? Boolean(isVerified) : true,
      verified: isVerified !== undefined ? Boolean(isVerified) : true,
      bio: bio || '',
      avatar:
        'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop&crop=face',
    })

    const result = newDoctor.toObject()
    delete result.password

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        _id: result._id.toString(),
        sentReferrals: 0,
        receivedReferrals: 0,
      },
    })
  } catch (error: any) {
    console.error('Admin POST Doctor Error:', error)
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}
