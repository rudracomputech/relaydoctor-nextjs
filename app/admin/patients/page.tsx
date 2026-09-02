import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import Patient from "@/models/Patient"
import Referral from "@/models/Referral"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/header'
import { Main } from '@/components/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Users, Phone, Calendar, Stethoscope, HeartPulse } from "lucide-react"

export default async function PatientsPage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect('/auth/sign-in')
  }

  await connectToDatabase()

  const patients = await Patient.find()
    .populate('registeredBy', 'name specialization')
    .sort({ createdAt: -1 })
    .lean()

  const patientsWithReferrals = await Promise.all(
    patients.map(async (pat: any) => {
      const referralCount = await Referral.countDocuments({
        $or: [{ patientId: pat._id }, { contactNumber: pat.phone }],
      })
      return {
        ...pat,
        referralCount,
      }
    })
  )

  return (
    <>
      <Header>
        <div className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-blue-600" />
          <h2 className='text-lg font-semibold tracking-tight'>Patients Registry</h2>
        </div>
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Patient Records</h1>
            <p className='text-muted-foreground text-sm'>
              Central registry of referred patients, medical backgrounds, and specialist consultations.
            </p>
          </div>
          <Badge variant="outline" className="px-3 py-1 bg-blue-50 text-blue-700 border-blue-200">
            {patients.length} Active Records
          </Badge>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Registered Patients</CardTitle>
            <CardDescription>Clinical files and assigned referring physicians</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground text-left">
                    <th className="pb-3 font-medium">Patient Name & Demographics</th>
                    <th className="pb-3 font-medium">Contact Phone</th>
                    <th className="pb-3 font-medium">Primary Physician</th>
                    <th className="pb-3 font-medium">Clinical Summary</th>
                    <th className="pb-3 font-medium text-center">Referrals</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {patientsWithReferrals.map((pat: any) => (
                    <tr key={pat._id.toString()} className="hover:bg-muted/40 transition-colors">
                      <td className="py-4">
                        <div className="font-semibold text-foreground flex items-center gap-2">
                          <HeartPulse className="h-4 w-4 text-rose-500" />
                          {pat.name}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {pat.gender || 'Unknown'} &bull; {pat.age ? `${pat.age} yrs` : 'Age N/A'}
                        </div>
                      </td>
                      <td className="py-4 font-mono text-xs">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          {pat.phone}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="text-xs font-medium">
                          {pat.registeredBy ? pat.registeredBy.name : 'Direct Intake'}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {pat.registeredBy?.specialization || 'Clinical Network'}
                        </div>
                      </td>
                      <td className="py-4 max-w-xs">
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {pat.medicalHistory || 'No documented prior medical history.'}
                        </p>
                      </td>
                      <td className="py-4 text-center">
                        <Badge variant="secondary" className="font-bold">
                          {pat.referralCount} case{pat.referralCount === 1 ? '' : 's'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </Main>
    </>
  )
}
