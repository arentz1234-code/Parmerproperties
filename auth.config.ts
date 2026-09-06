import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized() {
      return true
    },
    jwt({ token, user }) {
      if (user) token.role = (user as any).role
      return token
    },
    session({ session, token }) {
      if (token && session.user) (session.user as any).role = token.role
      return session
    },
  },
  providers: [],
} satisfies NextAuthConfig
