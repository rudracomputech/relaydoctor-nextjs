import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import User from "@/models/User"
import Referral from "@/models/Referral"

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
  Star,
  CheckCircle,
  Building2,
  Phone,
  Mail,
  Wallet,
  ArrowRightLeft,
} from "lucide-react"

export default async function DoctorsPage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect('/auth/sign-in')
  }

  await connectToDatabase()

  const doctors = await User.find({ role: 'doctor' }).sort({ rating: -1 }).lean()

  // For each doctor, count their referrals
  const doctorsWithStats = await Promise.all(
    doctors.map(async (doc: any) => {
      const sentReferrals = await Referral.countDocuments({ referringDoctorId: doc._id })
      const receivedReferrals = await Referral.countDocuments({ receivingDoctorId: doc._id })
      return {
        ...doc,
        sentReferrals,
        receivedReferrals,
      }
    })
  )

  return (
    <>
      <Header>
        <div className="flex items-center space-x-2">
          <Stethoscope className="h-5 w-5 text-teal-600" />
          <h2 className='text-lg font-semibold tracking-tight'>Specialist Doctors Directory</h2>
        </div>
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Verified Doctors</h1>
            <p className='text-muted-foreground text-sm'>
              Network of registered specialists participating in doctor-to-doctor patient referrals.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="px-3 py-1 bg-teal-50 text-teal-700 border-teal-200">
              {doctors.length} Registered Specialists
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {doctorsWithStats.map((doc: any) => (
            <Card key={doc._id.toString()} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <img
                    src={doc.avatar || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop&crop=face"}
                    alt={doc.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-teal-100 shadow-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-lg text-foreground truncate">{doc.name}</h3>
                      {doc.isVerified && (
                        <Badge className="bg-teal-100 text-teal-800 hover:bg-teal-100 border-0 flex items-center gap-1 text-xs">
                          <CheckCircle className="h-3 w-3" /> Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm font-medium text-teal-700 dark:text-teal-400">
                      {doc.specialization} &bull; {doc.experienceYears || 5} Years Exp
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Building2 className="h-3.5 w-3.5" />
                      <span>{doc.hospital || 'Hospital / Private Practice'}</span>
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 bg-muted/40 rounded-lg">
                    <div className="text-muted-foreground">Rating</div>
                    <div className="font-bold text-foreground flex items-center justify-center gap-1 mt-0.5">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      {doc.rating} <span className="text-[10px] text-muted-foreground">({doc.reviewCount || 100})</span>
                    </div>
                  </div>
                  <div className="p-2 bg-muted/40 rounded-lg">
                    <div className="text-muted-foreground">Referrals (Out/In)</div>
                    <div className="font-bold text-foreground mt-0.5">
                      {doc.sentReferrals} / {doc.receivedReferrals}
                    </div>
                  </div>
                  <div className="p-2 bg-muted/40 rounded-lg">
                    <div className="text-muted-foreground">Wallet Balance</div>
                    <div className="font-bold text-emerald-600 mt-0.5">
                      ₹{doc.walletBalance || 0}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1 truncate">
                    <Mail className="h-3.5 w-3.5" /> {doc.email}
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" /> {doc.phone || '+91 9800000000'}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Main>
    </>
  )
}
