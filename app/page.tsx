import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function RootPage() {
  const session = await auth()
  if (!session) redirect('/login')
  const role = (session.user as any)?.role
  if (role === 'MANAGER') redirect('/manager/dashboard')
  if (role === 'TENANT') redirect('/tenant/dashboard')
  redirect('/login')
}
