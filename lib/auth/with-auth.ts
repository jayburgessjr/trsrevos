import type { Session } from 'next-auth'
import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import { canAccessModule, type TrsModule, type TrsRole } from './rbac'

type WithAuthOptions = {
  module?: TrsModule
  redirectTo?: string
}

type WithAuthContext = {
  session: Session
  role: TrsRole
}

export async function withAuth<T>(
  handler: (context: WithAuthContext) => Promise<T>,
  options: WithAuthOptions = {}
): Promise<T> {
  const session = await auth()

  if (!session?.user) {
    const destination = options.redirectTo ?? '/api/auth/signin'
    redirect(destination)
  }

  const role = session.user.role
  if (options.module && !canAccessModule(role, options.module)) {
    redirect('/unauthorized')
  }

  return handler({ session, role })
}
