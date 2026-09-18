import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import Coupon from "@/models/Coupon"
import User from "@/models/User"

import { Header } from '@/components/header'
import { Main } from '@/components/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { TicketPercent } from "lucide-react"
import { CouponsClient } from "./components/coupons-client"

export default async function CouponsPage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect('/auth/sign-in')
  }

  await connectToDatabase()

  const coupons = await Coupon.find()
    .populate('assignedDoctors', 'name email specialization avatar')
    .sort({ createdAt: -1 })
    .lean()

  const doctors = await User.find({
    $or: [{ role: 'doctor' }, { userRole: 'doctor' }],
  })
    .select('name email specialization avatar')
    .sort({ name: 1 })
    .lean()

  const formattedDoctors = doctors.map((d: any) => ({
    _id: d._id.toString(),
    name: d.name,
    email: d.email,
    specialization: d.specialization || d.speciality || 'General',
    avatar: d.avatar || '',
  }))

  const formattedCoupons = coupons.map((c: any) => ({
    ...c,
    _id: c._id.toString(),
    assignedDoctors: (c.assignedDoctors || []).map((d: any) =>
      d?._id ? { ...d, _id: d._id.toString() } : d
    ),
    validUntil: c.validUntil ? new Date(c.validUntil).toISOString() : '',
    expiryDate: c.expiryDate ? new Date(c.expiryDate).toISOString() : '',
  }))

  return (
    <>
      <Header>
        <div className="flex items-center space-x-2">
          <TicketPercent className="h-5 w-5 text-amber-600" />
          <h2 className='text-lg font-semibold tracking-tight'>Coupons & Promotional Offers</h2>
        </div>
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-6'>
          <h1 className='text-2xl font-bold tracking-tight'>Vouchers & Discounts Management</h1>
          <p className='text-muted-foreground text-sm'>
            Configure promotional discount vouchers, redemption limits, and active doctor checkout offers.
          </p>
        </div>

        <CouponsClient initialCoupons={formattedCoupons} allDoctors={formattedDoctors} />
      </Main>
    </>
  )
}
