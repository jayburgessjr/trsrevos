import { redirect } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

import { createClient } from '@/lib/supabase/server'

export type AuthContext = {
  supabase: Awaited<ReturnType<typeof createClient>>
  user: User
  organizationId: string | null
}

async function resolveOrganizationId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
) {
  const { data: profile, error } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    console.error('auth:failed-to-resolve-organization', error)
    return null
  }

  return profile?.organization_id ?? null
}

export async function getAuthContext(): Promise<
  AuthContext | { supabase: Awaited<ReturnType<typeof createClient>>; user: null; organizationId: null }
> {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    console.error('auth:get-user-error', error)
    return { supabase, user: null, organizationId: null }
  }

  if (!user) {
    return { supabase, user: null, organizationId: null }
  }

  const organizationId = await resolveOrganizationId(supabase, user.id)

  return { supabase, user, organizationId }
}

export async function requireAuth(options?: { redirectTo?: string }): Promise<AuthContext> {
  const context = await getAuthContext()

  if (!context.user) {
    const target = options?.redirectTo ?? '/login'
    redirect(target)
  }

  return context as AuthContext
}
