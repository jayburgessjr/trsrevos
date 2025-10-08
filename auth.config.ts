import { PrismaAdapter } from '@auth/prisma-adapter'
import type { NextAuthConfig } from 'next-auth'
import type { Adapter } from 'next-auth/adapters'
import GoogleProvider from 'next-auth/providers/google'

import { prisma } from '@/lib/prisma'
import { isRole, type TrsRole } from '@/lib/auth/rbac'

const googleClientId = process.env.GOOGLE_CLIENT_ID
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET

if (!googleClientId || !googleClientSecret) {
  const missing = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'].filter(
    (key) => !process.env[key]
  )
  if (missing.length > 0 && process.env.NODE_ENV === 'production') {
    throw new Error(`Missing required Google auth environment variables: ${missing.join(', ')}`)
  }
}

export const SESSION_COOKIE_NAME =
  process.env.NODE_ENV === 'production' ? '__Secure-authjs.session-token' : 'authjs.session-token'

const authSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? 'dev-secret'

const prismaAdapter = PrismaAdapter(prisma) as unknown as Adapter

export const authConfig = {
  adapter: prismaAdapter,
  session: { strategy: 'jwt' },
  secret: authSecret,
  trustHost: true,
  cookies: {
    sessionToken: {
      name: SESSION_COOKIE_NAME,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },
  providers: [
    GoogleProvider({
      clientId: googleClientId ?? 'placeholder-client-id',
      clientSecret: googleClientSecret ?? 'placeholder-client-secret'
    })
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.sub as string) ?? session.user.id
        session.user.role = isRole(token.role ?? '') ? (token.role as TrsRole) : 'Viewer'
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        const typedRole = isRole((user as { role?: string })?.role ?? '')
          ? ((user as { role?: TrsRole }).role as TrsRole)
          : 'Viewer'
        token.role = typedRole
        token.sub = user.id
      } else if (!token.role && token.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { role: true }
        })
        token.role = dbUser?.role ?? 'Viewer'
      }
      return token
    }
  },
  events: {
    async createUser({ user }) {
      const existingSuperAdmin = await prisma.user.count({ where: { role: 'SuperAdmin' } })
      if (existingSuperAdmin === 0) {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: 'SuperAdmin' }
        })
      }
    }
  }
} satisfies NextAuthConfig
