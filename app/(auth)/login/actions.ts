'use server'

import { signIn } from '@/lib/auth'
import { AuthError } from 'next-auth'

const ROLE_REDIRECTS: Record<string, string> = {
  MANAGER: '/manager/dashboard',
  TENANT: '/tenant/dashboard',
  OWNER: '/tenant/dashboard',
}

const MOCK_ROLES: Record<string, string> = {
  'manager@parmerproperties.com': 'MANAGER',
  'tenant1@demo.com': 'TENANT',
  'owner@demo.com': 'OWNER',
}

export async function loginAction(
  _prevState: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required.' }
  }

  const role = MOCK_ROLES[email]
  const redirectTo = ROLE_REDIRECTS[role] ?? '/manager/dashboard'

  try {
    await signIn('credentials', { email, password, redirectTo })
  } catch (err) {
    if (err instanceof AuthError) {
      switch (err.type) {
        case 'CredentialsSignin':
          return { error: 'Invalid email or password. Please try again.' }
        default:
          return { error: 'Something went wrong. Please try again.' }
      }
    }
    // NEXT_REDIRECT thrown by signIn on success — let it propagate
    throw err
  }

  return { error: null }
}
