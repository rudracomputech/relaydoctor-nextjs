'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  PlusCircle,
  MinusCircle,
  History,
  TrendingUp,
  Receipt,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Clock,
  User,
} from 'lucide-react'

export interface DoctorWalletItem {
  _id: string
  doctorId: string
  doctor: {
    _id: string
    name: string
    email: string
    phone?: string
    specialization: string
    avatar?: string
    city?: string
    hospital?: string
    isVerified: boolean
  }
  balance: number
  availableBalance: number
  pendingBalance: number
  totalEarnings: number
  totalWithdrawn: number
  currency: string
  isActive: boolean
  updatedAt?: string
}

export interface WalletStats {
  totalCirculationBalance: number
  totalDoctorEarnings: number
  totalWithdrawn: number
  totalDoctorsCount: number
  pendingPayoutsTotal: number
  pendingPayoutsCount: number
}

export function WalletsClient({
  initialWallets,
  initialStats,
}: {
  initialWallets: DoctorWalletItem[]
  initialStats: WalletStats
}) {
  const [wallets, setWallets] = useState<DoctorWalletItem[]>(initialWallets)
  const [stats, setStats] = useState<WalletStats>(initialStats)
  const [search, setSearch] = useState('')

  // Adjust Balance Modal state
  const [adjustOpen, setAdjustOpen] = useState(false)
  const [selectedWallet, setSelectedWallet] = useState<DoctorWalletItem | null>(null)
  const [adjustAction, setAdjustAction] = useState<'credit' | 'debit'>('credit')
  const [adjustAmount, setAdjustAmount] = useState<string>('')
  const [adjustType, setAdjustType] = useState<string>('manual_adjustment')
  const [adjustNote, setAdjustNote] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)

  // Transaction Ledger Modal state
  const [ledgerOpen, setLedgerOpen] = useState(false)
  const [activeLedgerDoctor, setActiveLedgerDoctor] = useState<DoctorWalletItem | null>(null)
  const [ledgerTransactions, setLedgerTransactions] = useState<any[]>([])
  const [loadingLedger, setLoadingLedger] = useState(false)

  // Search filtered list
  const filteredWallets = wallets.filter((w) => {
    const q = search.toLowerCase()
    return (
      w.doctor.name.toLowerCase().includes(q) ||
      w.doctor.email.toLowerCase().includes(q) ||
      (w.doctor.specialization || '').toLowerCase().includes(q) ||
      (w.doctor.city || '').toLowerCase().includes(q)
    )
  })

  // Open adjust modal
  function openAdjustModal(wallet: DoctorWalletItem, defaultAction: 'credit' | 'debit' = 'credit') {
    setSelectedWallet(wallet)
    setAdjustAction(defaultAction)
    setAdjustAmount('')
    setAdjustType(defaultAction === 'credit' ? 'referral_bonus' : 'manual_debit')
    setAdjustNote('')
    setAdjustOpen(true)
  }

  // Open transaction history
  async function openTransactionHistory(wallet: DoctorWalletItem) {
    setActiveLedgerDoctor(wallet)
    setLedgerOpen(true)
    setLoadingLedger(true)
    try {
      const res = await fetch(`/api/admin/wallets/${wallet.doctorId}/transactions`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to fetch transactions')
      setLedgerTransactions(json.data.transactions || [])
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoadingLedger(false)
    }
  }

  // Handle balance adjustment submit
  async function handleAdjustSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedWallet) return

    const amt = Number(adjustAmount)
    if (!amt || amt <= 0) {
      toast.error('Please enter a valid amount greater than 0')
      return
    }

    if (adjustAction === 'debit' && selectedWallet.balance < amt) {
      toast.error(
        `Insufficient balance. Current balance is ₹${selectedWallet.balance}, cannot debit ₹${amt}.`
      )
      return
    }

    try {
      setSubmitting(true)
      const res = await fetch('/api/admin/wallets/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: selectedWallet.doctorId,
          action: adjustAction,
          amount: amt,
          type: adjustType,
          description: adjustNote || `Manual ${adjustAction} by admin`,
        }),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to adjust balance')

      const newBalance = json.data.balance
      const newTotalEarnings = json.data.totalEarnings

      // Update local wallet state
      setWallets((prev) =>
        prev.map((w) =>
          w.doctorId === selectedWallet.doctorId
            ? {
                ...w,
                balance: newBalance,
                availableBalance: newBalance,
                totalEarnings: newTotalEarnings,
              }
            : w
        )
      )

      // Update local stats
      setStats((prev) => ({
        ...prev,
        totalCirculationBalance:
          adjustAction === 'credit'
            ? prev.totalCirculationBalance + amt
            : prev.totalCirculationBalance - amt,
        totalDoctorEarnings:
          adjustAction === 'credit'
            ? prev.totalDoctorEarnings + amt
            : prev.totalDoctorEarnings,
      }))

      toast.success(
        `Successfully ${adjustAction === 'credit' ? 'credited' : 'debited'} ₹${amt} for Dr. ${
          selectedWallet.doctor.name
        }`
      )
      setAdjustOpen(false)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  // Calculate live preview in modal
  const numAdjustAmount = Number(adjustAmount) || 0
  const previewBalance = selectedWallet
    ? adjustAction === 'credit'
      ? selectedWallet.balance + numAdjustAmount
      : selectedWallet.balance - numAdjustAmount
    : 0

  return (
    <div className='space-y-6'>
      {/* Metric Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        <Card className='shadow-sm border-teal-100 dark:border-teal-950'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Doctor Circulating Balances
            </CardTitle>
            <Wallet className='h-4 w-4 text-teal-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold font-mono text-teal-700 dark:text-teal-400'>
              ₹{stats.totalCirculationBalance.toLocaleString('en-IN')}
            </div>
            <p className='text-xs text-muted-foreground mt-1'>
              Across {stats.totalDoctorsCount} registered doctors
            </p>
          </CardContent>
        </Card>

        <Card className='shadow-sm'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Lifetime Referral Earnings
            </CardTitle>
            <TrendingUp className='h-4 w-4 text-emerald-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold font-mono text-emerald-600'>
              ₹{stats.totalDoctorEarnings.toLocaleString('en-IN')}
            </div>
            <p className='text-xs text-muted-foreground mt-1'>
              Total accumulated referral rewards
            </p>
          </CardContent>
        </Card>

        <Card className='shadow-sm'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Total Disbursed Payouts
            </CardTitle>
            <Receipt className='h-4 w-4 text-indigo-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold font-mono text-indigo-600'>
              ₹{stats.totalWithdrawn.toLocaleString('en-IN')}
            </div>
            <p className='text-xs text-muted-foreground mt-1'>Settled to doctor bank accounts</p>
          </CardContent>
        </Card>

        <Card className='shadow-sm'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Pending Payout Requests
            </CardTitle>
            <AlertCircle className='h-4 w-4 text-amber-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold font-mono text-amber-600'>
              ₹{stats.pendingPayoutsTotal.toLocaleString('en-IN')}
            </div>
            <p className='text-xs text-muted-foreground mt-1'>
              {stats.pendingPayoutsCount} withdrawal requests pending
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Action and Search Bar */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
        <div className='relative flex-1 max-w-sm'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Search doctor, speciality, city...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='pl-9'
          />
        </div>
        <Badge variant='outline' className='text-muted-foreground self-start sm:self-auto'>
          Showing {filteredWallets.length} Doctor Wallets
        </Badge>
      </div>

      {/* Wallets Table */}
      <Card className='shadow-sm overflow-hidden border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Doctor Profile</TableHead>
              <TableHead>Speciality</TableHead>
              <TableHead className='text-right'>Available Balance</TableHead>
              <TableHead className='text-right'>Total Earnings</TableHead>
              <TableHead className='text-right'>Disbursed</TableHead>
              <TableHead className='text-center'>Pending Payout</TableHead>
              <TableHead className='text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredWallets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className='h-32 text-center text-muted-foreground'>
                  No doctor wallets found matching your search.
                </TableCell>
              </TableRow>
            ) : (
              filteredWallets.map((w) => (
                <TableRow key={w._id} className='hover:bg-muted/30'>
                  <TableCell>
                    <div className='flex items-center gap-3 py-0.5'>
                      <img
                        src={
                          w.doctor.avatar ||
                          'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop&crop=face'
                        }
                        alt={w.doctor.name}
                        className='h-10 w-10 rounded-full object-cover border border-teal-200 shrink-0 shadow-xs'
                      />
                      <div className='min-w-0'>
                        <div className='font-semibold text-foreground truncate flex items-center gap-1.5'>
                          <span>{w.doctor.name}</span>
                          {w.doctor.isVerified && (
                            <CheckCircle2 className='h-3.5 w-3.5 text-teal-600 shrink-0' />
                          )}
                        </div>
                        <div className='text-xs text-muted-foreground truncate'>
                          {w.doctor.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant='outline'
                      className='bg-teal-50 text-teal-700 border-teal-200 text-xs'
                    >
                      {w.doctor.specialization}
                    </Badge>
                  </TableCell>
                  <TableCell className='text-right font-mono font-bold text-teal-700 dark:text-teal-400'>
                    ₹{w.balance.toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell className='text-right font-mono font-semibold text-muted-foreground'>
                    ₹{w.totalEarnings.toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell className='text-right font-mono text-xs text-muted-foreground'>
                    ₹{w.totalWithdrawn.toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell className='text-center'>
                    {w.pendingBalance > 0 ? (
                      <Badge className='bg-amber-100 text-amber-800 border-amber-300 font-mono text-xs'>
                        ₹{w.pendingBalance.toLocaleString('en-IN')} Pending
                      </Badge>
                    ) : (
                      <span className='text-xs text-muted-foreground font-mono'>₹0</span>
                    )}
                  </TableCell>
                  <TableCell className='text-right'>
                    <div className='flex items-center justify-end gap-1.5'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => openAdjustModal(w, 'credit')}
                        className='h-8 text-xs text-emerald-700 hover:text-emerald-800 border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/50 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
                      >
                        <PlusCircle className='h-3.5 w-3.5 mr-1' /> Credit
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => openAdjustModal(w, 'debit')}
                        className='h-8 text-xs text-rose-700 hover:text-rose-800 border-rose-200 bg-rose-50/50 hover:bg-rose-100/50 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300'
                      >
                        <MinusCircle className='h-3.5 w-3.5 mr-1' /> Debit
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => openTransactionHistory(w)}
                        className='h-8 w-8 p-0 text-muted-foreground hover:text-foreground'
                        title='Transaction History'
                      >
                        <History className='h-4 w-4' />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Adjust Balance Dialog */}
      <Dialog open={adjustOpen} onOpenChange={setAdjustOpen}>
        <DialogContent className='sm:max-w-[480px]'>
          <form onSubmit={handleAdjustSubmit}>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2'>
                {adjustAction === 'credit' ? (
                  <PlusCircle className='h-5 w-5 text-emerald-600' />
                ) : (
                  <MinusCircle className='h-5 w-5 text-rose-600' />
                )}
                {adjustAction === 'credit' ? 'Credit Doctor Wallet' : 'Debit Doctor Wallet'}
              </DialogTitle>
              <DialogDescription>
                {selectedWallet
                  ? `Manual balance modification for Dr. ${selectedWallet.doctor.name}`
                  : 'Adjust doctor wallet funds.'}
              </DialogDescription>
            </DialogHeader>

            <div className='space-y-4 py-3'>
              {/* Doctor Summary Pill */}
              {selectedWallet && (
                <div className='flex items-center justify-between p-3 rounded-lg bg-muted/40 border text-xs'>
                  <div>
                    <div className='font-semibold text-foreground'>{selectedWallet.doctor.name}</div>
                    <div className='text-muted-foreground'>{selectedWallet.doctor.specialization}</div>
                  </div>
                  <div className='text-right'>
                    <div className='text-muted-foreground'>Current Balance</div>
                    <div className='font-mono font-bold text-sm text-teal-600'>
                      ₹{selectedWallet.balance.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Toggle */}
              <div className='space-y-1.5'>
                <Label className='text-xs font-semibold'>Operation</Label>
                <div className='grid grid-cols-2 gap-2'>
                  <Button
                    type='button'
                    variant={adjustAction === 'credit' ? 'default' : 'outline'}
                    onClick={() => setAdjustAction('credit')}
                    className={
                      adjustAction === 'credit'
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : ''
                    }
                  >
                    <PlusCircle className='h-4 w-4 mr-1.5' /> Credit (Add Funds)
                  </Button>
                  <Button
                    type='button'
                    variant={adjustAction === 'debit' ? 'default' : 'outline'}
                    onClick={() => setAdjustAction('debit')}
                    className={
                      adjustAction === 'debit'
                        ? 'bg-rose-600 hover:bg-rose-700 text-white'
                        : ''
                    }
                  >
                    <MinusCircle className='h-4 w-4 mr-1.5' /> Debit (Deduct)
                  </Button>
                </div>
              </div>

              {/* Amount Field */}
              <div className='space-y-1.5'>
                <Label htmlFor='adjust-amt' className='text-xs font-semibold'>
                  Amount to {adjustAction === 'credit' ? 'Credit' : 'Debit'} (₹) *
                </Label>
                <div className='relative'>
                  <Input
                    id='adjust-amt'
                    type='number'
                    min='1'
                    step='1'
                    placeholder='e.g., 500'
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(e.target.value)}
                    required
                    className='font-mono'
                  />
                  <span className='absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground'>
                    INR
                  </span>
                </div>
              </div>

              {/* Reason / Category */}
              <div className='space-y-1.5'>
                <Label htmlFor='adjust-cat' className='text-xs font-semibold'>
                  Adjustment Category
                </Label>
                <Select value={adjustType} onValueChange={setAdjustType}>
                  <SelectTrigger id='adjust-cat'>
                    <SelectValue placeholder='Select category' />
                  </SelectTrigger>
                  <SelectContent>
                    {adjustAction === 'credit' ? (
                      <>
                        <SelectItem value='referral_bonus'>Referral Bonus / Promotion</SelectItem>
                        <SelectItem value='consultation_settlement'>
                          Consultation Settlement
                        </SelectItem>
                        <SelectItem value='manual_adjustment'>Administrative Credit</SelectItem>
                        <SelectItem value='refund'>Reversal / Refund</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value='manual_debit'>Manual Administrative Debit</SelectItem>
                        <SelectItem value='payout_disbursement'>Offline Payout Settlement</SelectItem>
                        <SelectItem value='penalty'>Penalty / Policy Deduction</SelectItem>
                        <SelectItem value='correction'>Balance Correction</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <div className='space-y-1.5'>
                <Label htmlFor='adjust-notes' className='text-xs font-semibold'>
                  Audit Note / Reason
                </Label>
                <Input
                  id='adjust-notes'
                  placeholder='Reason for transaction ledger audit log'
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                />
              </div>

              {/* Live Preview Bar */}
              {numAdjustAmount > 0 && selectedWallet && (
                <div className='p-3 rounded-lg bg-muted/60 border text-xs space-y-1'>
                  <div className='flex justify-between text-muted-foreground'>
                    <span>Current Balance:</span>
                    <span className='font-mono'>₹{selectedWallet.balance}</span>
                  </div>
                  <div className='flex justify-between font-semibold'>
                    <span>Projected New Balance:</span>
                    <span
                      className={`font-mono font-bold ${
                        previewBalance < 0 ? 'text-rose-600' : 'text-teal-600'
                      }`}
                    >
                      ₹{previewBalance}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type='button' variant='outline' onClick={() => setAdjustOpen(false)}>
                Cancel
              </Button>
              <Button
                type='submit'
                disabled={submitting || (adjustAction === 'debit' && previewBalance < 0)}
                className={
                  adjustAction === 'credit'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-rose-600 hover:bg-rose-700 text-white'
                }
              >
                {submitting
                  ? 'Processing...'
                  : `${adjustAction === 'credit' ? 'Credit' : 'Debit'} ₹${numAdjustAmount || 0}`}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Transaction History Dialog */}
      <Dialog open={ledgerOpen} onOpenChange={setLedgerOpen}>
        <DialogContent className='sm:max-w-[640px] max-h-[85vh] flex flex-col'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <History className='h-5 w-5 text-teal-600' />
              <span>Wallet Ledger: {activeLedgerDoctor?.doctor.name}</span>
            </DialogTitle>
            <DialogDescription>
              Audit trail of all credits, debits, referral rewards, and disbursements.
            </DialogDescription>
          </DialogHeader>

          <div className='flex-1 overflow-y-auto py-2 space-y-3 pr-1'>
            {loadingLedger ? (
              <div className='text-center py-12 text-sm text-muted-foreground'>
                Loading transaction history...
              </div>
            ) : ledgerTransactions.length === 0 ? (
              <div className='text-center py-12 text-sm text-muted-foreground'>
                No transactions found for this doctor.
              </div>
            ) : (
              ledgerTransactions.map((tx: any) => {
                const isCredit =
                  tx.direction === 'credit' ||
                  tx.transactionType === 'Credit' ||
                  tx.type?.includes('credit') ||
                  tx.type?.includes('bonus')

                return (
                  <div
                    key={tx._id}
                    className='flex items-start justify-between p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors gap-3 text-xs'
                  >
                    <div className='flex items-start gap-2.5'>
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          isCredit
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {isCredit ? (
                          <ArrowDownLeft className='h-4 w-4' />
                        ) : (
                          <ArrowUpRight className='h-4 w-4' />
                        )}
                      </div>
                      <div>
                        <div className='font-semibold text-foreground text-sm'>
                          {tx.title || tx.type?.replace('_', ' ')}
                        </div>
                        <div className='text-muted-foreground mt-0.5'>
                          {tx.description || tx.referenceId || 'Manual adjustment'}
                        </div>
                        <div className='flex items-center gap-2 text-[11px] text-muted-foreground mt-1'>
                          <span className='font-mono'>Ref: {tx.referenceId || 'N/A'}</span>
                          <span>&bull;</span>
                          <span>
                            {tx.createdAt
                              ? new Date(tx.createdAt).toLocaleString('en-IN')
                              : 'Recent'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className='text-right shrink-0'>
                      <div
                        className={`font-mono font-bold text-sm ${
                          isCredit ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {isCredit ? '+' : '-'}₹{tx.amount?.toLocaleString('en-IN')}
                      </div>
                      <Badge
                        variant='outline'
                        className={`text-[10px] uppercase font-mono mt-1 ${
                          tx.status === 'completed'
                            ? 'border-emerald-300 text-emerald-700 bg-emerald-50 dark:bg-emerald-950'
                            : 'border-amber-300 text-amber-700 bg-amber-50 dark:bg-amber-950'
                        }`}
                      >
                        {tx.status || 'completed'}
                      </Badge>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          <DialogFooter>
            <Button variant='outline' onClick={() => setLedgerOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
