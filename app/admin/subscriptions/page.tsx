import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import SubscriptionPlan from "@/models/SubscriptionPlan"
import DoctorSubscription from "@/models/DoctorSubscription"

import { Header } from '@/components/header'
import { Main } from '@/components/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { CreditCard } from "lucide-react"
import { SubscriptionsClient } from "./components/subscriptions-client"

export default async function SubscriptionsPage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect('/auth/sign-in')
  }

  await connectToDatabase()

  const [plans, subscriptions] = await Promise.all([
    SubscriptionPlan.find().sort({ priceMonthly: 1 }).lean(),
    DoctorSubscription.find()
      .populate('doctorId', 'name specialization hospital email')
      .populate('planId', 'name priceMonthly priceAnnually')
      .sort({ createdAt: -1 })
      .lean(),
  ])

  const formattedPlans = plans.map((p: any) => ({
    ...p,
    _id: p._id.toString(),
  }))

  const formattedSubscriptions = subscriptions.map((s: any) => ({
    ...s,
    _id: s._id.toString(),
    doctorId: s.doctorId
      ? {
          _id: s.doctorId._id?.toString() || '',
          name: s.doctorId.name,
          specialization: s.doctorId.specialization,
          hospital: s.doctorId.hospital,
          email: s.doctorId.email,
        }
      : undefined,
    planId: s.planId
      ? {
          _id: s.planId._id?.toString() || '',
          name: s.planId.name,
          priceMonthly: s.planId.priceMonthly,
          priceAnnually: s.planId.priceAnnually,
        }
      : undefined,
    startDate: s.startDate ? new Date(s.startDate).toISOString() : '',
    endDate: s.endDate ? new Date(s.endDate).toISOString() : '',
  }))

  return (
    <>
      <Header>
        <div className="flex items-center space-x-2">
          <CreditCard className="h-5 w-5 text-purple-600" />
          <h2 className='text-lg font-semibold tracking-tight'>Subscription Plans & Doctor Memberships</h2>
        </div>
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-6'>
          <h1 className='text-2xl font-bold tracking-tight'>Subscription Plans & Memberships</h1>
          <p className='text-muted-foreground text-sm'>
            Configure doctor subscription pricing tiers, feature packages, and monitor active memberships.
          </p>
        </div>

        <SubscriptionsClient
          initialPlans={formattedPlans}
          initialSubscriptions={formattedSubscriptions}
        />
      </Main>
    </>
  )
}
