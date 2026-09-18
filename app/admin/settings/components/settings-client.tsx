'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import {
  Percent,
  Coins,
  IndianRupee,
  Save,
  CheckCircle2,
  HelpCircle,
  Calculator,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react'

export interface SettingData {
  _id?: string
  referralRewardType: 'percentage' | 'flat'
  referralPercentage: number
  referralFlatAmount: number
  minWithdrawalAmount: number
  autoApproveReferrals: boolean
  platformCommissionPercentage: number
  updatedAt?: string
}

export function SettingsClient({ initialSetting }: { initialSetting: SettingData }) {
  const [formData, setFormData] = useState<SettingData>(initialSetting)
  const [saving, setSaving] = useState(false)
  const [sampleFee, setSampleFee] = useState<number>(1000)

  // Simulation calculation
  const calculatedSampleBonus =
    formData.referralRewardType === 'percentage'
      ? Math.round((sampleFee * (formData.referralPercentage || 0)) / 100)
      : formData.referralFlatAmount || 0

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault()
    try {
      setSaving(true)
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to save settings')

      setFormData(json.data)
      toast.success('Platform referral and financial settings updated successfully!')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSaveSettings} className='space-y-6 max-w-4xl'>
      {/* Referral Bonus Configuration */}
      <Card className='shadow-sm border-teal-100 dark:border-teal-950'>
        <CardHeader className='pb-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-2.5'>
              <div className='h-9 w-9 rounded-lg bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center dark:bg-teal-950 dark:border-teal-800 dark:text-teal-300'>
                <Percent className='h-5 w-5' />
              </div>
              <div>
                <CardTitle className='text-lg'>Doctor Referral Reward Rules</CardTitle>
                <CardDescription>
                  Configure how referring doctors are compensated when their referred patient case is accepted.
                </CardDescription>
              </div>
            </div>
            <Badge
              variant='outline'
              className='bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950 dark:text-teal-300'
            >
              Mode: {formData.referralRewardType === 'percentage' ? 'Percentage Based' : 'Flat Reward'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className='space-y-6 pt-2'>
          {/* Mode Selection */}
          <div className='space-y-3'>
            <Label className='text-sm font-semibold'>Reward Calculation Mode</Label>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              {/* Option 1: Percentage */}
              <div
                onClick={() => setFormData({ ...formData, referralRewardType: 'percentage' })}
                className={`cursor-pointer rounded-xl border p-4 transition-all ${
                  formData.referralRewardType === 'percentage'
                    ? 'border-teal-600 bg-teal-50/50 dark:bg-teal-950/30 ring-1 ring-teal-600'
                    : 'border-muted hover:border-muted-foreground/40'
                }`}
              >
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-2'>
                    <Percent className='h-4 w-4 text-teal-600' />
                    <span className='font-semibold text-sm'>Percentage of Consultation Fee</span>
                  </div>
                  {formData.referralRewardType === 'percentage' && (
                    <CheckCircle2 className='h-4 w-4 text-teal-600' />
                  )}
                </div>
                <p className='text-xs text-muted-foreground mt-2'>
                  The referring doctor earns a dynamic percentage of the receiving specialist’s consultation fee.
                </p>
              </div>

              {/* Option 2: Flat Rate */}
              <div
                onClick={() => setFormData({ ...formData, referralRewardType: 'flat' })}
                className={`cursor-pointer rounded-xl border p-4 transition-all ${
                  formData.referralRewardType === 'flat'
                    ? 'border-teal-600 bg-teal-50/50 dark:bg-teal-950/30 ring-1 ring-teal-600'
                    : 'border-muted hover:border-muted-foreground/40'
                }`}
              >
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-2'>
                    <Coins className='h-4 w-4 text-teal-600' />
                    <span className='font-semibold text-sm'>Flat Fixed Bonus</span>
                  </div>
                  {formData.referralRewardType === 'flat' && (
                    <CheckCircle2 className='h-4 w-4 text-teal-600' />
                  )}
                </div>
                <p className='text-xs text-muted-foreground mt-2'>
                  Fixed rupee amount credited per successfully accepted referral, irrespective of consultation charges.
                </p>
              </div>
            </div>
          </div>

          {/* Amount Inputs */}
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2'>
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <Label htmlFor='ref-percentage' className='font-semibold text-sm flex items-center gap-1.5'>
                  Referral Percentage (%)
                  {formData.referralRewardType === 'percentage' && (
                    <Badge variant='secondary' className='text-[11px] py-0'>
                      Active Rule
                    </Badge>
                  )}
                </Label>
                <span className='font-mono font-bold text-teal-600'>{formData.referralPercentage}%</span>
              </div>
              <div className='relative'>
                <Input
                  id='ref-percentage'
                  type='number'
                  min='0'
                  max='100'
                  step='1'
                  value={formData.referralPercentage}
                  onChange={(e) =>
                    setFormData({ ...formData, referralPercentage: Number(e.target.value) })
                  }
                  className='font-mono'
                />
                <span className='absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground'>
                  %
                </span>
              </div>
              <p className='text-[11px] text-muted-foreground'>
                Recommended: 10% - 20% of the patient’s consultation charge.
              </p>
            </div>

            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <Label htmlFor='ref-flat' className='font-semibold text-sm flex items-center gap-1.5'>
                  Fallback / Flat Amount (₹)
                  {formData.referralRewardType === 'flat' && (
                    <Badge variant='secondary' className='text-[11px] py-0'>
                      Active Rule
                    </Badge>
                  )}
                </Label>
                <span className='font-mono font-bold text-teal-600'>₹{formData.referralFlatAmount}</span>
              </div>
              <div className='relative'>
                <Input
                  id='ref-flat'
                  type='number'
                  min='0'
                  step='50'
                  value={formData.referralFlatAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, referralFlatAmount: Number(e.target.value) })
                  }
                  className='font-mono'
                />
                <span className='absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground'>
                  INR
                </span>
              </div>
              <p className='text-[11px] text-muted-foreground'>
                Used if flat mode is selected or if specialist consultation fee is ₹0.
              </p>
            </div>
          </div>

          {/* Live Simulator Card */}
          <div className='rounded-xl border bg-muted/30 p-4 space-y-3'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <Calculator className='h-4 w-4 text-teal-600' />
                <span className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                  Live Payout Simulator
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-xs text-muted-foreground'>Specialist Fee:</span>
                <div className='flex gap-1'>
                  {[500, 1000, 2000].map((amt) => (
                    <button
                      key={amt}
                      type='button'
                      onClick={() => setSampleFee(amt)}
                      className={`text-xs px-2 py-0.5 rounded border transition-colors ${
                        sampleFee === amt
                          ? 'bg-teal-600 text-white border-teal-600'
                          : 'bg-background hover:bg-muted'
                      }`}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-3 rounded-lg border'>
              <div>
                <div className='text-sm text-foreground font-medium'>
                  Specialist Consultation Fee: <span className='font-mono font-bold'>₹{sampleFee}</span>
                </div>
                <div className='text-xs text-muted-foreground mt-0.5'>
                  {formData.referralRewardType === 'percentage'
                    ? `Calculation: ${formData.referralPercentage}% of ₹${sampleFee}`
                    : `Calculation: Flat rate of ₹${formData.referralFlatAmount}`}
                </div>
              </div>
              <div className='text-right'>
                <div className='text-xs text-muted-foreground'>Referring Doctor Receives</div>
                <div className='text-xl font-bold font-mono text-emerald-600'>
                  ₹{calculatedSampleBonus}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Platform & Financial Policies */}
      <Card className='shadow-sm'>
        <CardHeader className='pb-4'>
          <div className='flex items-center space-x-2.5'>
            <div className='h-9 w-9 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center dark:bg-indigo-950 dark:border-indigo-800 dark:text-indigo-300'>
              <IndianRupee className='h-5 w-5' />
            </div>
            <div>
              <CardTitle className='text-lg'>Disbursement & Wallet Safeguards</CardTitle>
              <CardDescription>
                Minimum threshold for withdrawal requests and platform commission.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className='space-y-4 pt-2'>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
            <div className='space-y-2'>
              <Label htmlFor='min-withdraw' className='font-semibold text-sm'>
                Minimum Withdrawal Threshold (₹)
              </Label>
              <div className='relative'>
                <Input
                  id='min-withdraw'
                  type='number'
                  min='100'
                  step='100'
                  value={formData.minWithdrawalAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, minWithdrawalAmount: Number(e.target.value) })
                  }
                  className='font-mono'
                />
                <span className='absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground'>
                  INR
                </span>
              </div>
              <p className='text-[11px] text-muted-foreground'>
                Minimum available balance doctors must accumulate before submitting a payout request.
              </p>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='plat-commission' className='font-semibold text-sm'>
                Platform Processing Commission (%)
              </Label>
              <div className='relative'>
                <Input
                  id='plat-commission'
                  type='number'
                  min='0'
                  max='50'
                  step='0.5'
                  value={formData.platformCommissionPercentage}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      platformCommissionPercentage: Number(e.target.value),
                    })
                  }
                  className='font-mono'
                />
                <span className='absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground'>
                  %
                </span>
              </div>
              <p className='text-[11px] text-muted-foreground'>
                Platform share retained for network hosting and administration.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Footer */}
      <div className='flex items-center justify-end gap-3 pt-2'>
        <Button
          type='submit'
          disabled={saving}
          className='bg-teal-600 hover:bg-teal-700 text-white min-w-36'
        >
          {saving ? (
            <>
              <RefreshCw className='h-4 w-4 mr-2 animate-spin' /> Saving...
            </>
          ) : (
            <>
              <Save className='h-4 w-4 mr-2' /> Save Policy Settings
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
