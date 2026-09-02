import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import WithdrawalRequest from "@/models/WithdrawalRequest"

import { Header } from '@/components/header'
import { Main } from '@/components/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Wallet } from "lucide-react"
import { WithdrawalsClient } from "./components/withdrawals-client"

export default async function WithdrawalsPage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect('/auth/sign-in')
  }

  await connectToDatabase()

  const rawWithdrawals = await WithdrawalRequest.find()
    .populate('doctorId', 'name email specialization')
    .sort({ createdAt: -1 })
    .lean()

  const withdrawals = JSON.parse(JSON.stringify(rawWithdrawals))

  return (
    <>
      <Header>
        <div className="flex items-center space-x-2">
          <Wallet className="h-5 w-5 text-amber-600" />
          <h2 className='text-lg font-semibold tracking-tight'>Doctor Payout Withdrawals</h2>
        </div>
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-6'>
          <h1 className='text-2xl font-bold tracking-tight'>Doctor Earnings Payouts</h1>
          <p className='text-muted-foreground text-sm'>
            Review requested bank withdrawals from doctor referral bonuses and consultation fees.
          </p>
        </div>

        <WithdrawalsClient initialWithdrawals={withdrawals} />
      </Main>
    </>
  )
}
