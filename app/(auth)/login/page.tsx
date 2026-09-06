'use client'

import { useActionState, useRef } from 'react'
import { useFormStatus } from 'react-dom'
import Image from 'next/image'
import { loginAction } from './actions'

const DEMO_ACCOUNTS = [
  { label: 'Manager', email: 'manager@parmerproperties.com', color: 'bg-[#2D3561]' },
  { label: 'Tenant', email: 'tenant1@demo.com', color: 'bg-emerald-500' },
  { label: 'Owner', email: 'owner@demo.com', color: 'bg-amber-500' },
]

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-3 px-4 rounded-lg bg-[#2D3561] text-white font-semibold text-sm tracking-wide hover:bg-[#3d4780] active:bg-[#232a52] disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#2D3561] focus:ring-offset-2"
    >
      {pending ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Signing in…
        </span>
      ) : (
        'Sign In'
      )}
    </button>
  )
}

export default function LoginPage() {
  const [state, formAction] = useActionState(loginAction, { error: null })
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  function fillAs(email: string) {
    if (emailRef.current) emailRef.current.value = email
    if (passwordRef.current) passwordRef.current.value = 'password123'
  }

  return (
    <div className="w-full max-w-md">
      {/* Card */}
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Card header band */}
        <div className="bg-gradient-to-r from-[#2D3561] to-[#3d4780] px-8 py-8 flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center p-1 ring-1 ring-white/20">
            <Image
              src="/logo.png"
              alt="Parmer Properties logo"
              width={56}
              height={56}
              className="object-contain"
              priority
            />
          </div>
          <div className="text-center">
            <h1 className="text-white text-xl font-bold tracking-tight">Parmer Properties</h1>
            <p className="text-blue-200 text-sm mt-0.5">Property Management Portal</p>
          </div>
        </div>

        {/* Form body */}
        <div className="px-8 py-8">
          <h2 className="text-gray-800 text-lg font-semibold mb-1">Welcome back</h2>
          <p className="text-gray-500 text-sm mb-6">Sign in to access your portal</p>

          <form action={formAction} className="space-y-4">
            {/* Error message */}
            {state?.error && (
              <div className="flex items-start gap-2.5 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
                <svg className="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-red-700 text-sm">{state.error}</p>
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                ref={emailRef}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white focus:border-[#2D3561] focus:ring-2 focus:ring-[#2D3561]/20 outline-none transition-colors duration-150"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                ref={passwordRef}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white focus:border-[#2D3561] focus:ring-2 focus:ring-[#2D3561]/20 outline-none transition-colors duration-150"
              />
            </div>

            <div className="pt-1">
              <SubmitButton />
            </div>
          </form>

          {/* Quick login buttons */}
          <div className="mt-6 rounded-xl bg-gray-50 border border-gray-100 px-4 py-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick login as</p>
            <div className="flex gap-2">
              {DEMO_ACCOUNTS.map(({ label, email, color }) => (
                <button
                  key={email}
                  type="button"
                  onClick={() => fillAs(email)}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:border-gray-300 hover:bg-gray-50 active:bg-gray-100 transition-colors duration-150"
                >
                  <span className={`w-2 h-2 rounded-full ${color} shrink-0`} />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <p className="text-center text-blue-200/60 text-xs mt-6">
        © {new Date().getFullYear()} Parmer Properties. All rights reserved.
      </p>
    </div>
  )
}
