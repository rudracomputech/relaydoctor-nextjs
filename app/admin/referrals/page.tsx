import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import Referral from "@/models/Referral"

import { Header } from '@/components/header'
import { Main } from '@/components/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { GitPullRequest } from "lucide-react"
import { ReferralsClient } from "./components/referrals-client"

export default async function ReferralsPage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect('/auth/sign-in')
  }

  await connectToDatabase()

  const rawReferrals = await Referral.find()
    .populate('referringDoctorId', 'name specialization hospital avatar phone')
    .populate('receivingDoctorId', 'name specialization hospital avatar phone')
    .sort({ createdAt: -1 })
    .lean()

  const referrals = JSON.parse(JSON.stringify(rawReferrals))

  return (
    <>
      <Header>
        <div className="flex items-center space-x-2">
          <GitPullRequest className="h-5 w-5 text-teal-600" />
          <h2 className='text-lg font-semibold tracking-tight'>Referral Tickets & Patient Cases</h2>
        </div>
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-6'>
          <h1 className='text-2xl font-bold tracking-tight'>Referral Network Pipeline</h1>
          <p className='text-muted-foreground text-sm'>
            Review and track patient cases referred between physicians, inspect diagnosis, and supervise outcomes.
          </p>
        </div>

        <ReferralsClient initialReferrals={referrals} />
      </Main>
    </>
  )
}
