import NextAuth from 'next-auth'
import { authConfig } from './auth.config'
import { NextResponse } from 'next/server'

const { auth } = NextAuth(authConfig)

export const proxy = auth((request: any) => {
  const { pathname } = request.nextUrl

  // Public routes — always allow
  if (
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname === '/login' ||
    pathname.startsWith('/apply') ||
    pathname === '/favicon.ico' ||
    pathname === '/logo.png'
  ) {
    return NextResponse.next()
  }

  const session = request.auth

  // Not logged in → redirect to login
  if (!session) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  const role = (session.user as any)?.role

  // Role-based route guards
  if (pathname.startsWith('/manager') && role !== 'MANAGER') {
    return NextResponse.redirect(new URL('/tenant/dashboard', request.url))
  }

  if (pathname.startsWith('/tenant') && role !== 'TENANT') {
    return NextResponse.redirect(new URL('/manager/dashboard', request.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|logo.png|public).*)'],
}
