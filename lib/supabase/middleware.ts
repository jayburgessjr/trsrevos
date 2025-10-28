import { NextResponse, type NextRequest } from 'next/server'

type SupabaseUser = {
  id: string
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

async function getSupabaseUser(request: NextRequest): Promise<SupabaseUser | null> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return null
  }

  const accessTokenCookie =
    request.cookies.get('sb-access-token') ||
    request.cookies.get('sb:access_token') ||
    request.cookies.getAll().find((cookie) => cookie.name.includes('access-token'))

  const accessToken = accessTokenCookie?.value

  if (!accessToken) {
    return null
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        apikey: SUPABASE_ANON_KEY,
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      return null
    }

    const data = (await response.json()) as SupabaseUser
    return data
  } catch (error) {
    console.error('Failed to verify Supabase session in middleware', error)
    return null
  }
}

export async function updateSession(request: NextRequest) {
  const user = await getSupabaseUser(request)
  const { pathname } = request.nextUrl

  // Protect all routes except explicitly public ones and API routes
  const isApiRoute = pathname.startsWith('/api/')
  const publicExactRoutes = ['/login']
  const publicPrefixes = ['/forms']
  const isPublicRoute =
    publicExactRoutes.includes(pathname) || publicPrefixes.some((prefix) => pathname.startsWith(prefix))

  if (!user && !isPublicRoute && !isApiRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    // Store the original URL to redirect back after login
    url.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(url)
  }

  // If user is logged in and trying to access login page, redirect to home
  if (user && pathname === '/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}
