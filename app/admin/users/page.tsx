import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import User from "@/models/User"

import { Header } from '@/components/header'
import { Main } from '@/components/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { ShieldCheck } from "lucide-react"
import { UsersClient } from "./components/users-client"

export default async function UsersPage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect('/auth/sign-in')
  }

  await connectToDatabase()

  const users = await User.find()
    .select('-password')
    .sort({ createdAt: -1 })
    .lean()

  const formattedUsers = users.map((u: any) => ({
    ...u,
    _id: u._id.toString(),
    permissions: u.permissions || (u.role === 'admin' ? ['admin:all'] : []),
  }))

  const currentUserId = (session.user as any)?.id

  return (
    <>
      <Header>
        <div className="flex items-center space-x-2">
          <ShieldCheck className="h-5 w-5 text-purple-600" />
          <h2 className='text-lg font-semibold tracking-tight'>Access Management & Security</h2>
        </div>
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-6'>
          <h1 className='text-2xl font-bold tracking-tight'>Users, Roles & Permissions</h1>
          <p className='text-muted-foreground text-sm'>
            Manage platform team accounts, administrative roles, security permissions, and access status.
          </p>
        </div>

        <UsersClient initialUsers={formattedUsers} currentUserId={currentUserId} />
      </Main>
    </>
  )
}
