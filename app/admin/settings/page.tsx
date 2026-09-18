import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import Setting from "@/models/Setting"

import { Header } from '@/components/header'
import { Main } from '@/components/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Settings } from "lucide-react"
import { SettingsClient, type SettingData } from "./components/settings-client"

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect('/auth/sign-in')
  }

  await connectToDatabase()

  let setting = await Setting.findOne().lean()
  if (!setting) {
    const created = await Setting.create({
      referralRewardType: 'percentage',
      referralPercentage: 10,
      referralFlatAmount: 500,
      minWithdrawalAmount: 500,
      autoApproveReferrals: false,
      platformCommissionPercentage: 5,
    })
    setting = (created as any).toObject ? (created as any).toObject() : created
  }

  const formattedSetting: SettingData = {
    _id: (setting as any)._id?.toString() || '',
    referralRewardType: ((setting as any).referralRewardType as 'percentage' | 'flat') || 'percentage',
    referralPercentage: Number((setting as any).referralPercentage ?? 10),
    referralFlatAmount: Number((setting as any).referralFlatAmount ?? 500),
    minWithdrawalAmount: Number((setting as any).minWithdrawalAmount ?? 500),
    autoApproveReferrals: Boolean((setting as any).autoApproveReferrals),
    platformCommissionPercentage: Number((setting as any).platformCommissionPercentage ?? 5),
    updatedAt: (setting as any).updatedAt ? new Date((setting as any).updatedAt).toISOString() : '',
  }

  return (
    <>
      <Header>
        <div className="flex items-center space-x-2">
          <Settings className="h-5 w-5 text-teal-600" />
          <h2 className='text-lg font-semibold tracking-tight'>System & Platform Settings</h2>
        </div>
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-6'>
          <h1 className='text-2xl font-bold tracking-tight'>Platform Financial & Referral Policies</h1>
          <p className='text-muted-foreground text-sm'>
            Configure referral bonus percentage calculation, minimum withdrawal thresholds, and platform network rules.
          </p>
        </div>

        <SettingsClient initialSetting={formattedSetting} />
      </Main>
    </>
  )
}
