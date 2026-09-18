import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import User from "@/models/User"
import Referral from "@/models/Referral"
import Wallet from "@/models/Wallet"

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

  const doctorIds = doctors.map((d: any) => d._id)

  const [wallets, sentCounts, receivedCounts] = await Promise.all([
    Wallet.find({
      $or: [
        { doctorId: { $in: doctorIds } },
        { user: { $in: doctorIds } },
      ],
    }).lean(),
    Referral.aggregate([
      { $match: { referringDoctorId: { $in: doctorIds } } },
      { $group: { _id: '$referringDoctorId', count: { $sum: 1 } } },
    ]),
    Referral.aggregate([
      { $match: { receivingDoctorId: { $in: doctorIds } } },
      { $group: { _id: '$receivingDoctorId', count: { $sum: 1 } } },
    ]),
  ])

  const walletMap = new Map()
  wallets.forEach((w: any) => {
    if (w.doctorId) walletMap.set(w.doctorId.toString(), w)
    if (w.user) walletMap.set(w.user.toString(), w)
  })

  const sentMap = new Map()
  sentCounts.forEach((s: any) => sentMap.set(s._id.toString(), s.count))

  const receivedMap = new Map()
  receivedCounts.forEach((r: any) => receivedMap.set(r._id.toString(), r.count))

  const doctorsWithStats = doctors.map((doc: any) => {
    const docIdStr = doc._id.toString()
    const docWallet = walletMap.get(docIdStr)
    return {
      ...doc,
      _id: docIdStr,
      walletBalance: docWallet
        ? (docWallet.availableBalance ?? docWallet.balance ?? 0)
        : (doc.walletBalance ?? 0),
      totalEarnings: docWallet
        ? (docWallet.totalEarnings ?? 0)
        : (doc.totalEarnings ?? 0),
      pendingBalance: docWallet ? (docWallet.pendingBalance ?? 0) : 0,
      totalWithdrawn: docWallet ? (docWallet.totalWithdrawn ?? 0) : 0,
      sentReferrals: sentMap.get(docIdStr) || 0,
      receivedReferrals: receivedMap.get(docIdStr) || 0,
    }
  })

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
