'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Wallet, CheckCircle2, Clock, XCircle, Banknote, User } from 'lucide-react'

export function WithdrawalsClient({ initialWithdrawals }: { initialWithdrawals: any[] }) {
  const [withdrawals, setWithdrawals] = useState(initialWithdrawals)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  async function updateWithdrawalStatus(id: string, newStatus: string) {
    try {
      setLoadingId(id)
      const res = await fetch(`/api/admin/withdrawals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update')

      setWithdrawals((prev) =>
        prev.map((w) => (w._id === id ? { ...w, status: newStatus } : w))
      )
      toast.success(`Withdrawal marked as ${newStatus}`)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Doctor Payout Requests</CardTitle>
        <CardDescription>
          Review earnings withdrawal requests and disburse payouts directly to verified bank accounts.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-muted-foreground text-left">
                <th className="pb-3 font-medium">Doctor</th>
                <th className="pb-3 font-medium">Requested Amount</th>
                <th className="pb-3 font-medium">Bank Details</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    No withdrawal requests recorded.
                  </td>
                </tr>
              ) : (
                withdrawals.map((w) => (
                  <tr key={w._id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-4">
                      <div className="font-semibold text-foreground flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        {w.doctorId?.name || 'Doctor'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {w.doctorId?.email}
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="text-lg font-bold text-foreground">₹{w.amount}</span>
                    </td>
                    <td className="py-4">
                      <div className="font-medium text-foreground">{w.bankName}</div>
                      <div className="text-xs font-mono text-muted-foreground">
                        {w.accountNumber} &bull; {w.accountHolderName}
                      </div>
                    </td>
                    <td className="py-4">
                      {w.status === 'pending' && (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
                          Pending Review
                        </Badge>
                      )}
                      {w.status === 'approved' && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                          Approved
                        </Badge>
                      )}
                      {w.status === 'paid' && (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300">
                          Disbursed (Paid)
                        </Badge>
                      )}
                      {w.status === 'rejected' && (
                        <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-300">
                          Rejected
                        </Badge>
                      )}
                    </td>
                    <td className="py-4 text-xs text-muted-foreground">
                      {new Date(w.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {w.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-blue-700 hover:bg-blue-50 border-blue-300 h-8"
                              disabled={loadingId === w._id}
                              onClick={() => updateWithdrawalStatus(w._id, 'approved')}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="default"
                              className="bg-emerald-600 hover:bg-emerald-700 h-8"
                              disabled={loadingId === w._id}
                              onClick={() => updateWithdrawalStatus(w._id, 'paid')}
                            >
                              Disburse (Pay)
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-8"
                              disabled={loadingId === w._id}
                              onClick={() => updateWithdrawalStatus(w._id, 'rejected')}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {w.status === 'approved' && (
                          <Button
                            size="sm"
                            variant="default"
                            className="bg-emerald-600 hover:bg-emerald-700 h-8"
                            disabled={loadingId === w._id}
                            onClick={() => updateWithdrawalStatus(w._id, 'paid')}
                          >
                            Mark as Paid
                          </Button>
                        )}
                        {w.status === 'paid' && (
                          <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 justify-end">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Settled
                          </span>
                        )}
                        {w.status === 'rejected' && (
                          <span className="text-xs text-rose-600 font-medium flex items-center gap-1 justify-end">
                            <XCircle className="h-3.5 w-3.5" /> Refunded
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
