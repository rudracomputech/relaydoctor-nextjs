import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { connectToDatabase } from "./mongodb"
import User from "@/models/User"
import type { JWT } from "next-auth/jwt"
import type { Session, User as NextAuthUser } from "next-auth"

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {},
      async authorize(credentials) {
        const creds = credentials as { email?: string; password?: string } | undefined

        if (!creds?.email || !creds?.password) {
          return null
        }

        const { email, password } = creds

        try {
          await connectToDatabase()

          const user = await User.findOne({ email: email.toLowerCase().trim() })
          if (!user) {
            return null
          }

          if (user.password) {
            const isValid = await bcrypt.compare(password, user.password)
            if (!isValid) {
              return null
            }
          }

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            permissions: user.role === 'admin' ? ['admin:all', 'manage:doctors', 'manage:referrals'] : ['user:standard']
          } as unknown as NextAuthUser
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  session: { strategy: "jwt" as const },
  pages: {
    signIn: '/auth/sign-in',
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: any }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.name = user.name
        token.permissions = user.permissions || []
      }
      return token
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        (session.user as any).id = token.id
        ;(session.user as any).role = token.role
        ;(session.user as any).permissions = token.permissions
      }
      return session
    }
  }
}
