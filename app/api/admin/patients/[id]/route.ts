import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import Patient from '@/models/Patient'
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
    const patient = await Patient.findById(id)
      .populate('registeredBy', 'name specialization hospital')
      .populate('doctorId', 'name specialization hospital')
      .lean()

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    const referralCount = await Referral.countDocuments({
      $or: [{ patientId: patient._id }, { contactNumber: patient.phone || patient.mobile }],
    })

    return NextResponse.json({
      success: true,
      data: {
        ...patient,
        _id: patient._id.toString(),
        referralCount,
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
    const patient = await Patient.findById(id)
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    if (body.name) patient.name = body.name.trim()
    if (body.patientId !== undefined) patient.patientId = body.patientId
    if (body.avatar !== undefined) patient.avatar = body.avatar
    if (body.phone) {
      patient.phone = body.phone.trim()
      patient.mobile = body.phone.trim()
    }
    if (body.age !== undefined) patient.age = Number(body.age)
    if (body.gender) patient.gender = body.gender
    if (body.bloodGroup !== undefined) patient.bloodGroup = body.bloodGroup
    if (body.condition !== undefined) {
      patient.condition = body.condition
      patient.problem = body.condition
    }
    if (body.allergies !== undefined) patient.allergies = body.allergies
    if (body.caseStatus !== undefined) patient.caseStatus = body.caseStatus
    if (body.registeredBy !== undefined) {
      patient.registeredBy = body.registeredBy || null
      patient.doctorId = body.registeredBy || null
    }
    if (body.medicalHistory !== undefined) {
      patient.medicalHistory = body.medicalHistory
      if (!body.condition) patient.problem = body.medicalHistory
    }
    if (body.medicalHistoryTags !== undefined) {
      patient.medicalHistoryTags = Array.isArray(body.medicalHistoryTags)
        ? body.medicalHistoryTags
        : []
    }
    if (body.reports !== undefined) {
      patient.reports = Array.isArray(body.reports) ? body.reports : []
    }
    if (body.diagnosis !== undefined) patient.diagnosis = body.diagnosis
    if (body.prescription !== undefined) patient.prescription = body.prescription
    if (body.address !== undefined) patient.address = body.address
    if (body.emergencyContact !== undefined) patient.emergencyContact = body.emergencyContact

    await patient.save()

    const populated = (await Patient.findById(id)
      .populate('registeredBy', 'name specialization hospital')
      .populate('doctorId', 'name specialization hospital')
      .lean()) as any

    return NextResponse.json({
      success: true,
      data: {
        ...populated,
        _id: (populated?._id || id).toString(),
      },
    })
  } catch (error: any) {
    console.error('Admin PUT Patient Error:', error)
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
    const deleted = await Patient.findByIdAndDelete(id)
    if (!deleted) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Patient deleted successfully' })
  } catch (error: any) {
    console.error('Admin DELETE Patient Error:', error)
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}
