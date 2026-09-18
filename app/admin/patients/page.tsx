import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import Patient from "@/models/Patient"
import Referral from "@/models/Referral"
import User from "@/models/User"

import { Header } from '@/components/header'
import { Main } from '@/components/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Users } from "lucide-react"
import { PatientsClient } from "./components/patients-client"

export default async function PatientsPage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect('/auth/sign-in')
  }

  await connectToDatabase()

  const [patients, doctors] = await Promise.all([
    Patient.find()
      .populate('registeredBy', 'name specialization hospital')
      .sort({ createdAt: -1 })
      .lean(),
    User.find({ $or: [{ role: 'doctor' }, { userRole: 'doctor' }] })
      .select('name specialization hospital')
      .lean(),
  ])

  const patientIds = patients.map((p: any) => p._id)
  const patientPhones = patients
    .map((p: any) => p.phone || p.mobile)
    .filter(Boolean)

  const referralList = await Referral.find({
    $or: [
      { patientId: { $in: patientIds } },
      { contactNumber: { $in: patientPhones } },
    ],
  })
    .select('patientId contactNumber')
    .lean()

  const countByPatientId = new Map<string, number>()
  const countByPhone = new Map<string, number>()
  referralList.forEach((r: any) => {
    if (r.patientId) {
      const pid = r.patientId.toString()
      countByPatientId.set(pid, (countByPatientId.get(pid) || 0) + 1)
    } else if (r.contactNumber) {
      countByPhone.set(r.contactNumber, (countByPhone.get(r.contactNumber) || 0) + 1)
    }
  })

  const patientsWithReferrals = patients.map((pat: any) => {
    const pid = pat._id.toString()
    const phone = pat.phone || pat.mobile
    const referralCount =
      (countByPatientId.get(pid) || 0) +
      (phone ? countByPhone.get(phone) || 0 : 0)

    return {
      ...pat,
      _id: pid,
      referralCount,
    }
  })

  const doctorOptions = doctors.map((d: any) => ({
    _id: d._id.toString(),
    name: d.name,
    specialization: d.specialization || d.speciality,
    hospital: d.hospital,
  }))

  return (
    <>
      <Header>
        <div className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-blue-600" />
          <h2 className='text-lg font-semibold tracking-tight'>Patients Registry</h2>
        </div>
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-6'>
          <h1 className='text-2xl font-bold tracking-tight'>Patient Records Management</h1>
          <p className='text-muted-foreground text-sm'>
            Central registry of referred patients, medical backgrounds, and specialist consultations.
          </p>
        </div>

        <PatientsClient initialPatients={patientsWithReferrals} doctors={doctorOptions} />
      </Main>
    </>
  )
}
