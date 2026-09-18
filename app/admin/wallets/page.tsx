import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import User from "@/models/User"
import Wallet from "@/models/Wallet"
import WithdrawalRequest from "@/models/WithdrawalRequest"

import { Header } from '@/components/header'
import { Main } from '@/components/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Wallet as WalletIcon } from "lucide-react"
import { WalletsClient } from "./components/wallets-client"

export default async function WalletsPage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect('/auth/sign-in')
  }

  await connectToDatabase()

  const doctors = await User.find({
    $or: [{ role: 'doctor' }, { userRole: 'doctor' }],
  })
    .select('name email phone specialization speciality avatar profileImage city hospital walletBalance totalEarnings isVerified')
    .sort({ name: 1 })
    .lean()

  const wallets = await Wallet.find().lean()
  const walletMap: Record<string, any> = {}
  wallets.forEach((w: any) => {
    const docId = w.doctorId?.toString() || w.user?.toString()
    if (docId) {
      walletMap[docId] = w
    }
  })

  const pendingWithdrawals = await WithdrawalRequest.find({
    status: { $in: ['Pending', 'pending', 'Under Review'] },
  }).lean()

  const pendingMap: Record<string, number> = {}
  pendingWithdrawals.forEach((pw: any) => {
    const docId = pw.doctorId?.toString() || pw.userId?.toString()
    if (docId) {
      pendingMap[docId] = (pendingMap[docId] || 0) + (pw.amount || 0)
    }
  })

  let totalCirculationBalance = 0
  let totalDoctorEarnings = 0
  let totalWithdrawn = 0

  const doctorWallets = doctors.map((doc: any) => {
    const docId = doc._id.toString()
    const w = walletMap[docId]

    const balance = w ? (w.availableBalance ?? w.balance ?? 0) : (doc.walletBalance ?? 0)
    const earnings = w ? (w.totalEarnings ?? 0) : (doc.totalEarnings ?? 0)
    const withdrawn = w ? (w.totalWithdrawn ?? 0) : 0
    const pendingPayout = pendingMap[docId] || 0

    totalCirculationBalance += balance
    totalDoctorEarnings += earnings
    totalWithdrawn += withdrawn

    return {
      _id: w?._id ? w._id.toString() : `wallet_${docId}`,
      doctorId: docId,
      doctor: {
        _id: docId,
        name: doc.name,
        email: doc.email,
        phone: doc.phone,
        specialization: doc.specialization || doc.speciality || 'General',
        avatar: doc.avatar || doc.profileImage || '',
        city: doc.city || '',
        hospital: doc.hospital || '',
        isVerified: Boolean(doc.isVerified),
      },
      balance,
      availableBalance: balance,
      pendingBalance: pendingPayout,
      totalEarnings: earnings,
      totalWithdrawn: withdrawn,
      currency: w?.currency || 'INR',
      isActive: w ? w.isActive ?? true : true,
      updatedAt: w?.updatedAt ? new Date(w.updatedAt).toISOString() : '',
    }
  })

  doctorWallets.sort((a, b) => b.balance - a.balance)

  const stats = {
    totalCirculationBalance,
    totalDoctorEarnings,
    totalWithdrawn,
    totalDoctorsCount: doctors.length,
    pendingPayoutsTotal: Object.values(pendingMap).reduce((a, b) => a + b, 0),
    pendingPayoutsCount: pendingWithdrawals.length,
  }

  return (
    <>
      <Header>
        <div className="flex items-center space-x-2">
          <WalletIcon className="h-5 w-5 text-teal-600" />
          <h2 className='text-lg font-semibold tracking-tight'>Doctor Wallets & Balances</h2>
        </div>
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-6'>
          <h1 className='text-2xl font-bold tracking-tight'>Doctor Wallet Management</h1>
          <p className='text-muted-foreground text-sm'>
            Monitor specialist account balances, perform manual credit/debit adjustments, and inspect full doctor transaction ledgers.
          </p>
        </div>

        <WalletsClient initialWallets={doctorWallets} initialStats={stats} />
      </Main>
    </>
  )
}
