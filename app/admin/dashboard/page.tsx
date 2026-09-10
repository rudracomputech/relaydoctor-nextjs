import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import User from "@/models/User"
import Referral from "@/models/Referral"
import DoctorSubscription from "@/models/DoctorSubscription"
import WithdrawalRequest from "@/models/WithdrawalRequest"
import Transaction from "@/models/Transaction"
import Patient from "@/models/Patient"

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/header'
import { Main } from '@/components/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import {
  Stethoscope,
  Users,
  GitPullRequest,
  CreditCard,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Wallet,
} from "lucide-react"

export default async function Dashboard() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/sign-in')
  }

  await connectToDatabase()

  // Fetch real-time statistics from MongoDB
  const [
    totalDoctors,
    totalPatients,
    totalReferrals,
    pendingReferrals,
    inProgressReferrals,
    completedReferrals,
    activeSubscriptions,
    pendingWithdrawals,
    recentReferrals,
    recentTransactions,
  ] = await Promise.all([
    User.countDocuments({ role: 'doctor' }),
    Patient.countDocuments(),
    Referral.countDocuments(),
    Referral.countDocuments({ status: 'pending' }),
    Referral.countDocuments({ status: 'in_progress' }),
    Referral.countDocuments({ status: 'completed' }),
    DoctorSubscription.countDocuments({ status: 'active' }),
    WithdrawalRequest.countDocuments({ status: 'pending' }),
    Referral.find()
      .populate('referringDoctorId', 'name specialization hospital avatar')
      .populate('receivingDoctorId', 'name specialization hospital avatar')
      .sort({ createdAt: -1 })
      .limit(6)
      .lean(),
    Transaction.find()
      .populate('doctorId', 'name specialization')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
  ])

  // Calculate platform metrics
  const totalVolume = recentTransactions.reduce((acc, t) => acc + (t.amount || 0), 0)

  return (
    <>
      {/* Top Heading */}
      <Header>
        <div className="flex items-center space-x-2">
          <Stethoscope className="h-5 w-5 text-teal-600" />
          <h2 className='text-lg font-semibold tracking-tight'>relaydor Command Center</h2>
        </div>
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      {/* Main Content */}
      <Main>
        <div className='mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Platform Overview</h1>
            <p className='text-muted-foreground text-sm'>
              Monitor medical referrals, specialist network, subscription plans, and payout disbursements.
            </p>
          </div>
          <div className='flex items-center space-x-2'>
            <Link href="/admin/referrals">
              <Button variant="default" className="bg-teal-600 hover:bg-teal-700">
                <GitPullRequest className="mr-2 h-4 w-4" /> View All Referrals
              </Button>
            </Link>
            <Link href="/admin/doctors">
              <Button variant="outline">
                <Stethoscope className="mr-2 h-4 w-4" /> Manage Doctors
              </Button>
            </Link>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6'>
          {/* Doctors */}
          <Card className="border-l-4 border-l-teal-500 shadow-sm">
            <CardHeader className='flex flex-row items-center justify-between pb-2 space-y-0'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Specialist Doctors
              </CardTitle>
              <div className="p-2 bg-teal-50 dark:bg-teal-950/40 rounded-lg">
                <Stethoscope className='h-4 w-4 text-teal-600 dark:text-teal-400' />
              </div>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{totalDoctors}</div>
              <p className='text-muted-foreground text-xs mt-1 flex items-center gap-1'>
                <span className="text-emerald-600 font-medium">100% verified</span> across specialties
              </p>
            </CardContent>
          </Card>

          {/* Active Referrals */}
          <Card className="border-l-4 border-l-blue-500 shadow-sm">
            <CardHeader className='flex flex-row items-center justify-between pb-2 space-y-0'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Total Referrals
              </CardTitle>
              <div className="p-2 bg-blue-50 dark:bg-blue-950/40 rounded-lg">
                <GitPullRequest className='h-4 w-4 text-blue-600 dark:text-blue-400' />
              </div>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{totalReferrals}</div>
              <p className='text-muted-foreground text-xs mt-1 flex items-center gap-1.5'>
                <Badge variant="outline" className="text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200">
                  {pendingReferrals} Pending
                </Badge>
                <Badge variant="outline" className="text-blue-600 bg-blue-50 dark:bg-blue-950/40 border-blue-200">
                  {inProgressReferrals} In Care
                </Badge>
              </p>
            </CardContent>
          </Card>

          {/* Active Subscriptions */}
          <Card className="border-l-4 border-l-purple-500 shadow-sm">
            <CardHeader className='flex flex-row items-center justify-between pb-2 space-y-0'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Active Subscriptions
              </CardTitle>
              <div className="p-2 bg-purple-50 dark:bg-purple-950/40 rounded-lg">
                <CreditCard className='h-4 w-4 text-purple-600 dark:text-purple-400' />
              </div>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{activeSubscriptions}</div>
              <p className='text-muted-foreground text-xs mt-1 flex items-center gap-1'>
                <TrendingUp className="h-3.5 w-3.5 text-purple-600" />
                <span>Annual & Monthly tiers active</span>
              </p>
            </CardContent>
          </Card>

          {/* Pending Payouts */}
          <Card className="border-l-4 border-l-amber-500 shadow-sm">
            <CardHeader className='flex flex-row items-center justify-between pb-2 space-y-0'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Pending Withdrawals
              </CardTitle>
              <div className="p-2 bg-amber-50 dark:bg-amber-950/40 rounded-lg">
                <Wallet className='h-4 w-4 text-amber-600 dark:text-amber-400' />
              </div>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{pendingWithdrawals}</div>
              <Link href="/admin/withdrawals" className='text-amber-600 hover:underline text-xs mt-1 inline-flex items-center gap-1'>
                Requires review & disbursement <ArrowUpRight className="h-3 w-3" />
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Middle Section: Recent Referrals & Financial Activity */}
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-7'>
          {/* Recent Referrals Table */}
          <Card className='col-span-1 lg:col-span-4 shadow-sm'>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Recent Patient Referrals</CardTitle>
                <CardDescription>Latest clinical cases dispatched across specialists</CardDescription>
              </div>
              <Link href="/admin/referrals">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground text-left">
                      <th className="pb-3 font-medium">Ticket / Patient</th>
                      <th className="pb-3 font-medium">Referring &rarr; Receiving</th>
                      <th className="pb-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {recentReferrals.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-6 text-center text-muted-foreground">
                          No referrals recorded yet.
                        </td>
                      </tr>
                    ) : (
                      recentReferrals.map((ref: any) => (
                        <tr key={ref._id.toString()} className="hover:bg-muted/50 transition-colors">
                          <td className="py-3">
                            <div className="font-semibold text-foreground">{ref.patientName}</div>
                            <div className="text-xs text-muted-foreground">{ref.ticketNumber} &bull; {ref.diagnosis?.slice(0, 30)}...</div>
                          </td>
                          <td className="py-3">
                            <div className="text-xs font-medium">
                              Dr. {ref.referringDoctorId?.name?.replace('Dr. ', '') || 'Doctor'}
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              &rarr; Dr. {ref.receivingDoctorId?.name?.replace('Dr. ', '') || 'Specialist'} ({ref.receivingDoctorId?.specialization})
                            </div>
                          </td>
                          <td className="py-3">
                            {ref.status === 'pending' && (
                              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
                                Pending
                              </Badge>
                            )}
                            {ref.status === 'in_progress' && (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                                In Progress
                              </Badge>
                            )}
                            {ref.status === 'completed' && (
                              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300">
                                Completed
                              </Badge>
                            )}
                            {ref.status === 'declined' && (
                              <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-300">
                                Declined
                              </Badge>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Platform Activity & Referrals Status Breakdown */}
          <Card className='col-span-1 lg:col-span-3 shadow-sm'>
            <CardHeader>
              <CardTitle className="text-lg">Referral Network Status</CardTitle>
              <CardDescription>Clinical workflow stages</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Progress bars / status counters */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-500" /> Pending Acceptance
                  </span>
                  <span className="font-bold">{pendingReferrals}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-amber-500 h-2 rounded-full"
                    style={{ width: `${totalReferrals ? (pendingReferrals / totalReferrals) * 100 : 0}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <ArrowUpRight className="h-4 w-4 text-blue-500" /> In Active Care
                  </span>
                  <span className="font-bold">{inProgressReferrals}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${totalReferrals ? (inProgressReferrals / totalReferrals) * 100 : 0}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Completed Cases
                  </span>
                  <span className="font-bold">{completedReferrals}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full"
                    style={{ width: `${totalReferrals ? (completedReferrals / totalReferrals) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Recent Ledger Entries
                </h4>
                <div className="space-y-3">
                  {recentTransactions.map((tx: any) => (
                    <div key={tx._id.toString()} className="flex items-center justify-between text-xs">
                      <div>
                        <p className="font-medium text-foreground">{tx.title}</p>
                        <p className="text-muted-foreground">{tx.description?.slice(0, 32)}</p>
                      </div>
                      <span className={tx.direction === 'credit' ? 'text-emerald-600 font-semibold' : 'text-rose-600 font-semibold'}>
                        {tx.direction === 'credit' ? '+' : '-'}₹{tx.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Main>
    </>
  )
}
