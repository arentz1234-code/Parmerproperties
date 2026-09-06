import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { authConfig } from '@/auth.config'
import { z } from 'zod'

const mockUsers = [
  { id: 'user_manager', email: 'manager@parmerproperties.com', name: 'Andrew Rentz', password: 'password123', role: 'MANAGER' },
  { id: 'user_tenant1', email: 'tenant1@demo.com', name: 'Sarah Mitchell', password: 'password123', role: 'TENANT' },
  { id: 'user_owner', email: 'owner@demo.com', name: 'James Parmer', password: 'password123', role: 'OWNER' },
]

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = z.object({ email: z.string().email(), password: z.string().min(1) }).safeParse(credentials)
        if (!parsed.success) return null
        const { email, password } = parsed.data
        const user = mockUsers.find(u => u.email === email && u.password === password)
        if (!user) return null
        return { id: user.id, email: user.email, name: user.name, role: user.role }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.role = (user as any).role
      return token
    },
    session({ session, token }) {
      if (token && session.user) (session.user as any).role = token.role
      return session
    },
  },
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET ?? 'parmer-properties-secret-key-2026',
})
