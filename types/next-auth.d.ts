import type { TrsRole } from '@/lib/auth/rbac'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      role: TrsRole
    }
  }

  interface User {
    role: TrsRole
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: TrsRole
  }
}

export {}
