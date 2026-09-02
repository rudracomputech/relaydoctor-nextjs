import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import SubscriptionPlan from "@/models/SubscriptionPlan"
import DoctorSubscription from "@/models/DoctorSubscription"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/header'
import { Main } from '@/components/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { CreditCard, Check, Sparkles, Calendar, User } from "lucide-react"

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
        <div className='mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Subscription Plans</h1>
            <p className='text-muted-foreground text-sm'>
              Configure doctor subscription pricing, teleconsultation quotas, and monitor active memberships.
            </p>
          </div>
        </div>

        {/* Plans Grid (Matching Figma Subscription Screen) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {plans.map((plan: any) => (
            <Card key={plan._id.toString()} className={`relative overflow-hidden ${plan.isPopular ? 'border-2 border-purple-500 shadow-md' : 'shadow-sm'}`}>
              {plan.badge && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-purple-100 text-purple-800 border-0 flex items-center gap-1 font-semibold">
                    <Sparkles className="h-3 w-3" /> {plan.badge}
                  </Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-xl font-bold text-foreground">{plan.name}</CardTitle>
                <CardDescription>{plan.tagline || 'Better care with priority access'}</CardDescription>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-foreground">₹{plan.priceAnnually}</span>
                  <span className="text-sm text-muted-foreground">/ year</span>
                  <span className="text-xs text-muted-foreground ml-2">(or ₹{plan.priceMonthly}/month)</span>
                </div>
                {plan.annualSavingsText && (
                  <p className="text-xs font-semibold text-emerald-600 mt-1">{plan.annualSavingsText}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2">
                  Included Features:
                </div>
                {plan.features?.map((feat: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    <div className="rounded-full bg-emerald-100 p-0.5 text-emerald-600 mt-0.5">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-foreground">{feat}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Doctor Subscriptions Table */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Doctor Subscriptions</CardTitle>
            <CardDescription>Live active doctor subscriptions and renewals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground text-left">
                    <th className="pb-3 font-medium">Doctor</th>
                    <th className="pb-3 font-medium">Plan</th>
                    <th className="pb-3 font-medium">Cycle & Amount</th>
                    <th className="pb-3 font-medium">Valid Until</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {subscriptions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-muted-foreground">
                        No active subscriptions.
                      </td>
                    </tr>
                  ) : (
                    subscriptions.map((sub: any) => (
                      <tr key={sub._id.toString()} className="hover:bg-muted/40 transition-colors">
                        <td className="py-4">
                          <div className="font-semibold text-foreground flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                            {sub.doctorId?.name}
                          </div>
                          <div className="text-xs text-muted-foreground">{sub.doctorId?.specialization} &bull; {sub.doctorId?.hospital}</div>
                        </td>
                        <td className="py-4 font-medium">{sub.planId?.name || 'Standard'}</td>
                        <td className="py-4">
                          <div className="font-semibold text-foreground">₹{sub.amount}</div>
                          <span className="text-xs text-muted-foreground capitalize">{sub.billingCycle}</span>
                        </td>
                        <td className="py-4 text-xs font-mono">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {new Date(sub.endDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-4">
                          <Badge className="bg-emerald-100 text-emerald-800 border-0">
                            {sub.status}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </Main>
    </>
  )
}
