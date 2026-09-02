import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import Transaction from "@/models/Transaction"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/header'
import { Main } from '@/components/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Receipt, ArrowDownLeft, ArrowUpRight, User } from "lucide-react"

export default async function TransactionsPage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect('/auth/sign-in')
  }

  await connectToDatabase()

  const transactions = await Transaction.find()
    .populate('doctorId', 'name email specialization')
    .sort({ createdAt: -1 })
    .lean()

  return (
    <>
      <Header>
        <div className="flex items-center space-x-2">
          <Receipt className="h-5 w-5 text-emerald-600" />
          <h2 className='text-lg font-semibold tracking-tight'>Transactions Ledger</h2>
        </div>
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Financial Audit Ledger</h1>
            <p className='text-muted-foreground text-sm'>
              Immutable record of all referral rewards, consultation charges, subscription payments, and disbursements.
            </p>
          </div>
          <Badge variant="outline" className="px-3 py-1 bg-emerald-50 text-emerald-700 border-emerald-200">
            {transactions.length} Total Entries
          </Badge>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Platform Movements</CardTitle>
            <CardDescription>Live real-time debits and credits across the network</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground text-left">
                    <th className="pb-3 font-medium">Doctor</th>
                    <th className="pb-3 font-medium">Transaction Title</th>
                    <th className="pb-3 font-medium">Category</th>
                    <th className="pb-3 font-medium">Amount</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground">
                        No transactions found.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((tx: any) => (
                      <tr key={tx._id.toString()} className="hover:bg-muted/40 transition-colors">
                        <td className="py-4">
                          <div className="font-semibold text-foreground flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                            {tx.doctorId?.name || 'Doctor'}
                          </div>
                          <div className="text-xs text-muted-foreground">{tx.doctorId?.email}</div>
                        </td>
                        <td className="py-4">
                          <div className="font-medium text-foreground">{tx.title}</div>
                          <div className="text-xs text-muted-foreground">{tx.description || tx.referenceId}</div>
                        </td>
                        <td className="py-4">
                          <Badge variant="secondary" className="capitalize text-xs">
                            {tx.type?.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="py-4 font-mono font-bold">
                          <span
                            className={
                              tx.direction === 'credit'
                                ? 'text-emerald-600 flex items-center gap-1'
                                : 'text-rose-600 flex items-center gap-1'
                            }
                          >
                            {tx.direction === 'credit' ? (
                              <ArrowDownLeft className="h-3.5 w-3.5" />
                            ) : (
                              <ArrowUpRight className="h-3.5 w-3.5" />
                            )}
                            {tx.direction === 'credit' ? '+' : '-'}₹{tx.amount}
                          </span>
                        </td>
                        <td className="py-4">
                          <Badge
                            className={
                              tx.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-800 border-0'
                                : 'bg-amber-100 text-amber-800 border-0'
                            }
                          >
                            {tx.status}
                          </Badge>
                        </td>
                        <td className="py-4 text-xs text-muted-foreground">
                          {new Date(tx.createdAt).toLocaleString()}
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
