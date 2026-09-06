import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isManagerRoute = nextUrl.pathname.startsWith('/manager')
      const isManagerApiRoute = nextUrl.pathname.startsWith('/api/manager')
      const isTenantRoute = nextUrl.pathname.startsWith('/tenant')
      const isPublicRoute = ['/login', '/apply'].some(p => nextUrl.pathname.startsWith(p))
      const isApiAuthRoute = nextUrl.pathname.startsWith('/api/auth')

      if (isApiAuthRoute) return true
      if (isPublicRoute) return true

      if (!isLoggedIn) return false

      const role = (auth?.user as any)?.role
      if (isManagerRoute && role !== 'MANAGER') return Response.redirect(new URL('/tenant/dashboard', nextUrl))
      if (isTenantRoute && role !== 'TENANT') return Response.redirect(new URL('/manager/dashboard', nextUrl))

      return true
    },
  },
  providers: [],
} satisfies NextAuthConfig
