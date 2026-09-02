import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import Coupon from "@/models/Coupon"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/header'
import { Main } from '@/components/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { TicketPercent, Tag, CheckCircle, Percent, DollarSign } from "lucide-react"

export default async function CouponsPage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect('/auth/sign-in')
  }

  await connectToDatabase()

  const coupons = await Coupon.find().sort({ createdAt: -1 }).lean()

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
        <div className='mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Vouchers & Discounts</h1>
            <p className='text-muted-foreground text-sm'>
              Active promotional discount codes available for doctor subscriptions during checkout.
            </p>
          </div>
          <Badge variant="outline" className="px-3 py-1 bg-amber-50 text-amber-700 border-amber-200">
            {coupons.length} Active Vouchers
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {coupons.map((coupon: any) => (
            <Card key={coupon._id.toString()} className="border-dashed border-2 shadow-sm hover:border-amber-400 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 rounded font-mono font-bold text-sm tracking-wider">
                    {coupon.code}
                  </span>
                  {coupon.isActive && (
                    <Badge className="bg-emerald-100 text-emerald-800 border-0 text-xs">
                      Active
                    </Badge>
                  )}
                </div>

                <div className="mt-4">
                  <div className="text-2xl font-black text-foreground">
                    {coupon.discountType === 'flat' ? `₹${coupon.discountValue} OFF` : `${coupon.discountValue}% OFF`}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {coupon.description || 'Special plan discount voucher'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t text-[11px] text-muted-foreground flex justify-between">
                  <span>Min Spend: <strong>₹{coupon.minOrderAmount || 0}</strong></span>
                  <span>Redeemed: <strong>{coupon.usageCount || 0} times</strong></span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Main>
    </>
  )
}
