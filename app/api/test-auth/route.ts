import { NextResponse } from 'next/server'
import { encode } from 'next-auth/jwt'

import { SESSION_COOKIE_NAME } from '@/auth.config'
import { isRole } from '@/lib/auth/rbac'

const isProduction = process.env.NODE_ENV === 'production'
const cookieName = SESSION_COOKIE_NAME
const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? 'dev-secret'
const defaultMaxAge = 60 * 60 * 24 * 30 // 30 days

type TestAuthPayload = {
  email?: string
  role?: string
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ message: 'Not found' }, { status: 404 })
  }

  const payload = (await request.json().catch(() => null)) as TestAuthPayload | null
  const email = payload?.email
  const role = payload?.role

  if (!email || !role || !isRole(role)) {
    return NextResponse.json({ message: 'Invalid payload' }, { status: 400 })
  }

  const token = await encode({
    secret,
    token: {
      email,
      sub: email,
      role
    },
    salt: cookieName,
    maxAge: defaultMaxAge
  })

  const response = NextResponse.json({ ok: true })
  response.cookies.set({
    name: cookieName,
    value: token,
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: isProduction,
    maxAge: defaultMaxAge
  })

  return response
}
