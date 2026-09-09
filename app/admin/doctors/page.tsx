import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import User from "@/models/User"
import Referral from "@/models/Referral"

import { Header } from '@/components/header'
import { Main } from '@/components/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Stethoscope } from "lucide-react"
import { DoctorsClient } from "./components/doctors-client"

export default async function DoctorsPage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect('/auth/sign-in')
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

  return (
    <>
      <Header>
        <div className="flex items-center space-x-2">
          <Stethoscope className="h-5 w-5 text-teal-600" />
          <h2 className='text-lg font-semibold tracking-tight'>Specialist Doctors Directory</h2>
        </div>
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-6'>
          <h1 className='text-2xl font-bold tracking-tight'>Verified Doctors Management</h1>
          <p className='text-muted-foreground text-sm'>
            Manage registered medical specialists, clinical affiliations, credentials, and referral metrics.
          </p>
        </div>

        <DoctorsClient initialDoctors={doctorsWithStats} />
      </Main>
    </>
  )
}
