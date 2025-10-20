import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { cookies, headers } from 'next/headers'

export function createServerClient() {
  const cookieStore = cookies()
  const headerStore = headers()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anon) {
    throw new Error('Supabase environment variables are not configured')
  }

  return createSupabaseServerClient(url, anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch (error) {
          // Server Components cannot set cookies directly; middleware will refresh sessions.
        }
      },
    },
    global: {
      headers: {
        'x-trs-host': headerStore.get('host') ?? '',
      },
    },
  })
}

export async function createClient() {
  return createServerClient()
}
