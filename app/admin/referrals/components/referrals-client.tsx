'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
  GitPullRequest,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Phone,
  Paperclip,
  FileText,
  User,
} from 'lucide-react'

export function ReferralsClient({ initialReferrals }: { initialReferrals: any[] }) {
  const [referrals, setReferrals] = useState(initialReferrals)
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed' | 'declined'>('all')
  const [selectedCase, setSelectedCase] = useState<any | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const filteredReferrals = referrals.filter((r) => {
    if (filter === 'all') return true
    return r.status === filter
  })

  async function updateStatus(id: string, newStatus: string) {
    try {
      setUpdatingId(id)
      const res = await fetch(`/api/admin/referrals/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update')

      setReferrals((prev) =>
        prev.map((item) => (item._id === id ? { ...item, status: newStatus } : item))
      )
      if (selectedCase && selectedCase._id === id) {
        setSelectedCase({ ...selectedCase, status: newStatus })
      }
      toast.success(`Referral status updated to ${newStatus}`)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div>
      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {(['all', 'pending', 'in_progress', 'completed', 'declined'] as const).map((tab) => (
          <Button
            key={tab}
            variant={filter === tab ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(tab)}
            className="capitalize"
          >
            {tab.replace('_', ' ')}
            <span className="ml-1.5 px-1.5 py-0.2 bg-background/20 rounded-full text-xs">
              {tab === 'all'
                ? referrals.length
                : referrals.filter((r) => r.status === tab).length}
            </span>
          </Button>
        ))}
      </div>

      {/* Referrals Table */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Medical Referrals & Patient Cases</CardTitle>
          <CardDescription>Real-time doctor-to-doctor clinical workflow pipeline</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground text-left">
                  <th className="pb-3 font-medium">Ticket # / Patient</th>
                  <th className="pb-3 font-medium">Referring Doctor</th>
                  <th className="pb-3 font-medium">Receiving Specialist</th>
                  <th className="pb-3 font-medium">Diagnosis & Reason</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredReferrals.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      No referrals found under this filter.
                    </td>
                  </tr>
                ) : (
                  filteredReferrals.map((r) => (
                    <tr key={r._id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-4">
                        <span className="font-bold text-teal-600 block">{r.ticketNumber}</span>
                        <span className="font-semibold text-foreground text-sm">{r.patientName}</span>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Phone className="h-3 w-3" /> {r.contactNumber}
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="font-medium text-foreground">{r.referringDoctorId?.name || 'Doctor'}</div>
                        <div className="text-xs text-muted-foreground">
                          {r.referringDoctorId?.specialization} &bull; {r.referringDoctorId?.hospital || 'Clinic'}
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="font-medium text-foreground">{r.receivingDoctorId?.name || 'Specialist'}</div>
                        <div className="text-xs text-muted-foreground">
                          {r.receivingDoctorId?.specialization} &bull; {r.receivingDoctorId?.hospital || 'Hospital'}
                        </div>
                      </td>
                      <td className="py-4 max-w-xs">
                        <p className="font-medium text-foreground truncate">{r.diagnosis}</p>
                        <p className="text-xs text-muted-foreground truncate">{r.reasonForReferral}</p>
                      </td>
                      <td className="py-4">
                        {r.status === 'pending' && (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
                            Pending
                          </Badge>
                        )}
                        {r.status === 'in_progress' && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                            In Progress
                          </Badge>
                        )}
                        {r.status === 'completed' && (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300">
                            Completed
                          </Badge>
                        )}
                        {r.status === 'declined' && (
                          <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-300">
                            Declined
                          </Badge>
                        )}
                      </td>
                      <td className="py-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedCase(r)}
                          className="h-8"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" /> View Case
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Case Details Dialog */}
      {selectedCase && (
        <Dialog open={!!selectedCase} onOpenChange={(open) => !open && setSelectedCase(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between gap-4">
                <DialogTitle className="text-xl flex items-center gap-2">
                  <GitPullRequest className="h-5 w-5 text-teal-600" />
                  Referral {selectedCase.ticketNumber}
                </DialogTitle>
                <Badge variant="outline" className="capitalize">
                  {selectedCase.status}
                </Badge>
              </div>
              <DialogDescription>
                Detailed clinical handoff case notes and diagnostic test history.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              {/* Patient Snapshot */}
              <div className="p-4 bg-muted/50 rounded-lg grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-xs text-muted-foreground block">Patient Name</span>
                  <span className="font-semibold text-foreground text-base">{selectedCase.patientName}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Contact Number</span>
                  <span className="font-mono text-foreground">{selectedCase.contactNumber}</span>
                </div>
              </div>

              {/* Doctors Routing */}
              <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg text-xs">
                <div>
                  <span className="text-muted-foreground block font-medium">Referring Physician</span>
                  <p className="font-semibold text-sm mt-0.5">{selectedCase.referringDoctorId?.name}</p>
                  <p className="text-muted-foreground">{selectedCase.referringDoctorId?.specialization}</p>
                  <p className="text-muted-foreground">{selectedCase.referringDoctorId?.hospital}</p>
                </div>
                <div>
                  <span className="text-muted-foreground block font-medium">Receiving Specialist</span>
                  <p className="font-semibold text-sm mt-0.5">{selectedCase.receivingDoctorId?.name}</p>
                  <p className="text-muted-foreground">{selectedCase.receivingDoctorId?.specialization}</p>
                  <p className="text-muted-foreground">{selectedCase.receivingDoctorId?.hospital}</p>
                </div>
              </div>

              {/* Diagnosis Details */}
              <div className="space-y-3">
                <div>
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground">Professional Diagnosis</h4>
                  <p className="text-sm font-medium text-foreground mt-1 p-3 bg-muted/30 rounded border">
                    {selectedCase.diagnosis}
                  </p>
                </div>

                {selectedCase.testName && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase text-muted-foreground">Recommended / Conducted Tests</h4>
                    <p className="text-sm text-foreground mt-1 p-3 bg-muted/30 rounded border">
                      {selectedCase.testName}
                    </p>
                  </div>
                )}

                <div>
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground">Reason for Referral</h4>
                  <p className="text-sm text-foreground mt-1 p-3 bg-muted/30 rounded border">
                    {selectedCase.reasonForReferral}
                  </p>
                </div>

                {selectedCase.feedbackNotes && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase text-muted-foreground">Additional Clinical Notes</h4>
                    <p className="text-sm text-foreground mt-1 p-3 bg-muted/30 rounded border">
                      {selectedCase.feedbackNotes}
                    </p>
                  </div>
                )}

                {selectedCase.nextFollowUpDate && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-4 w-4 text-teal-600" />
                    <span>Follow-up Scheduled: <strong>{new Date(selectedCase.nextFollowUpDate).toLocaleString()}</strong></span>
                  </div>
                )}

                {/* Attachments */}
                {selectedCase.attachments && selectedCase.attachments.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2 flex items-center gap-1">
                      <Paperclip className="h-3.5 w-3.5" /> Attached Scans / Reports ({selectedCase.attachments.length})
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedCase.attachments.map((url: string, idx: number) => (
                        <a
                          key={idx}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="block p-2 border rounded hover:border-teal-500 overflow-hidden"
                        >
                          <img src={url} alt="Medical scan" className="w-full h-24 object-cover rounded" />
                          <span className="text-[11px] text-teal-600 underline block mt-1">View Image</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Status Change Controls */}
              <div className="pt-4 border-t flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Change Status:</span>
                <div className="flex items-center gap-2">
                  {selectedCase.status !== 'accepted' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-emerald-700 hover:bg-emerald-50 border-emerald-300"
                      disabled={updatingId === selectedCase._id}
                      onClick={() => updateStatus(selectedCase._id, 'accepted')}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Mark Accepted
                    </Button>
                  )}
                  {selectedCase.status !== 'in_progress' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-blue-700 hover:bg-blue-50 border-blue-300"
                      disabled={updatingId === selectedCase._id}
                      onClick={() => updateStatus(selectedCase._id, 'in_progress')}
                    >
                      In Care
                    </Button>
                  )}
                  {selectedCase.status !== 'completed' && (
                    <Button
                      size="sm"
                      variant="default"
                      className="bg-emerald-600 hover:bg-emerald-700"
                      disabled={updatingId === selectedCase._id}
                      onClick={() => updateStatus(selectedCase._id, 'completed')}
                    >
                      Mark Completed
                    </Button>
                  )}
                  {selectedCase.status !== 'declined' && (
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={updatingId === selectedCase._id}
                      onClick={() => updateStatus(selectedCase._id, 'declined')}
                    >
                      Decline
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
