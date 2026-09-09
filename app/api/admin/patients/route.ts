import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import Patient from '@/models/Patient'
import Referral from '@/models/Referral'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    const patients = await Patient.find()
      .populate('registeredBy', 'name specialization hospital')
      .populate('doctorId', 'name specialization hospital')
      .sort({ createdAt: -1 })
      .lean()

    const patientsWithStats = await Promise.all(
      patients.map(async (pat: any) => {
        const referralCount = await Referral.countDocuments({
          $or: [{ patientId: pat._id }, { contactNumber: pat.phone || pat.mobile }],
        })
        return {
          ...pat,
          _id: pat._id.toString(),
          referralCount,
        }
      })
    )

    return NextResponse.json({ success: true, data: patientsWithStats })
  } catch (error: any) {
    console.error('Admin GET Patients Error:', error)
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
      phone,
      age,
      gender,
      registeredBy,
      medicalHistory,
      diagnosis,
      prescription,
      address,
      emergencyContact,
    } = body

    if (!name || !phone) {
      return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 })
    }

    await connectToDatabase()

    const newPatient = await Patient.create({
      name: name.trim(),
      phone: phone.trim(),
      mobile: phone.trim(),
      age: Number(age) || 30,
      gender: gender || 'male',
      registeredBy: registeredBy || null,
      doctorId: registeredBy || null,
      medicalHistory: medicalHistory || '',
      problem: medicalHistory || '',
      diagnosis: diagnosis || '',
      prescription: prescription || '',
      address: address || '',
      emergencyContact: emergencyContact || '',
      visitDate: new Date(),
    })

    const populated = (await Patient.findById(newPatient._id)
      .populate('registeredBy', 'name specialization hospital')
      .lean()) as any

    return NextResponse.json({
      success: true,
      data: {
        ...populated,
        _id: (populated?._id || newPatient._id).toString(),
        referralCount: 0,
      },
    })
  } catch (error: any) {
    console.error('Admin POST Patient Error:', error)
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}
