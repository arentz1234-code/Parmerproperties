'use server'

import { signIn } from '@/lib/auth'
import { AuthError } from 'next-auth'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export async function loginAction(
  _prevState: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required.' }
  }

  try {
    await signIn('credentials', { email, password, redirect: false })
  } catch (err) {
    if (err instanceof AuthError) {
      switch (err.type) {
        case 'CredentialsSignin':
          return { error: 'Invalid email or password. Please try again.' }
        default:
          return { error: 'Something went wrong. Please try again.' }
      }
    }
    // next-auth sometimes throws a NEXT_REDIRECT — let it propagate
    throw err
  }

  // Determine where to redirect after successful sign-in
  const session = await auth()
  const role = (session?.user as any)?.role

  if (role === 'MANAGER') {
    redirect('/manager/dashboard')
  } else if (role === 'TENANT') {
    redirect('/tenant/dashboard')
  } else {
    redirect('/login')
  }
}
