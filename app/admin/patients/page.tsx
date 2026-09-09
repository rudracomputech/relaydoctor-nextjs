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

  const patientsWithReferrals = await Promise.all(
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
