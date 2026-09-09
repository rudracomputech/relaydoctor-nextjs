import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import User from '@/models/User'
import Referral from '@/models/Referral'

export async function GET(req: Request, context: any) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const params = await context.params
    const { id } = params

    await connectToDatabase()
    const doctor = await User.findById(id).lean()
    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 })
    }

    const [sentReferrals, receivedReferrals] = await Promise.all([
      Referral.countDocuments({ referringDoctorId: doctor._id }),
      Referral.countDocuments({ receivingDoctorId: doctor._id }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        ...doctor,
        _id: doctor._id.toString(),
        sentReferrals,
        receivedReferrals,
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
    const doctor = await User.findById(id)
    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 })
    }

    if (body.name) doctor.name = body.name.trim()
    if (body.email) doctor.email = body.email.toLowerCase().trim()
    if (body.phone !== undefined) {
      doctor.phone = body.phone
      doctor.mobile = body.phone
    }
    if (body.specialization !== undefined) {
      doctor.specialization = body.specialization
      doctor.speciality = body.specialization
    }
    if (body.hospital !== undefined) doctor.hospital = body.hospital
    if (body.clinicAddress !== undefined) doctor.clinicAddress = body.clinicAddress
    if (body.hospitalAddress !== undefined) doctor.hospitalAddress = body.hospitalAddress
    if (body.gender !== undefined) doctor.gender = body.gender
    if (body.city !== undefined) doctor.city = body.city
    if (body.location !== undefined) doctor.location = body.location
    if (body.coordinates !== undefined) doctor.coordinates = body.coordinates
    if (body.additionalAddresses !== undefined) {
      doctor.additionalAddresses = Array.isArray(body.additionalAddresses)
        ? body.additionalAddresses
        : []
    }
    if (body.age !== undefined) doctor.age = body.age ? Number(body.age) : undefined
    if (body.dateOfBirth !== undefined) {
      doctor.dateOfBirth = body.dateOfBirth ? new Date(body.dateOfBirth) : undefined
    }
    if (body.education !== undefined) {
      doctor.education = Array.isArray(body.education) ? body.education : []
    }
    if (body.workSchedule !== undefined) {
      doctor.workSchedule = body.workSchedule
    }
    if (body.avatar !== undefined) doctor.avatar = body.avatar
    if (body.experienceYears !== undefined) doctor.experienceYears = Number(body.experienceYears)
    if (body.consultationFee !== undefined) doctor.consultationFee = Number(body.consultationFee)
    if (body.isVerified !== undefined) {
      doctor.isVerified = Boolean(body.isVerified)
      doctor.verified = Boolean(body.isVerified)
    }
    if (body.isBlocked !== undefined) doctor.isBlocked = Boolean(body.isBlocked)
    if (body.bio !== undefined) doctor.bio = body.bio
    if (body.availabilityStatus !== undefined) doctor.availabilityStatus = body.availabilityStatus

    await doctor.save()

    return NextResponse.json({
      success: true,
      data: {
        ...doctor.toObject(),
        _id: doctor._id.toString(),
      },
    })
  } catch (error: any) {
    console.error('Admin PUT Doctor Error:', error)
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
    const deleted = await User.findByIdAndDelete(id)
    if (!deleted) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Doctor deleted successfully' })
  } catch (error: any) {
    console.error('Admin DELETE Doctor Error:', error)
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}
