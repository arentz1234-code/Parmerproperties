'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AlertCircle } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createOwner } from '@/lib/actions/owner-actions'

const schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  address: z.string().optional(),
  taxId: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export default function NewOwnerPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      taxId: '',
    },
  })

  function onSubmit(values: FormValues) {
    setError(null)
    startTransition(async () => {
      try {
        const result = await createOwner({
          userId: 'user_owner_new',
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phone: values.phone || undefined,
          address: values.address || undefined,
          taxId: values.taxId || undefined,
        })
        if (!result.success) {
          setError(result.error)
          return
        }
        router.push('/manager/owners')
        router.refresh()
      } catch {
        setError('Unexpected error occurred.')
      }
    })
  }

  return (
    <div>
      <PageHeader title="Add Owner" description="Add a new property owner to your portfolio" />

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Owner Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Name */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  className="mt-1"
                  {...register('firstName')}
                  aria-invalid={!!errors.firstName}
                />
                {errors.firstName && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                    <AlertCircle size={11} /> {errors.firstName.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  className="mt-1"
                  {...register('lastName')}
                  aria-invalid={!!errors.lastName}
                />
                {errors.lastName && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                    <AlertCircle size={11} /> {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                className="mt-1"
                {...register('email')}
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                  <AlertCircle size={11} /> {errors.email.message}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(334) 555-0000"
                className="mt-1"
                {...register('phone')}
              />
            </div>

            {/* Address */}
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                placeholder="Street, City, State ZIP"
                className="mt-1"
                {...register('address')}
              />
            </div>

            {/* Tax ID */}
            <div>
              <Label htmlFor="taxId">Tax ID / SSN / EIN</Label>
              <Input
                id="taxId"
                placeholder="XXX-XX-XXXX"
                className="mt-1"
                {...register('taxId')}
              />
              <p className="mt-1 text-xs text-gray-500">
                Required for 1099 reporting. Stored securely.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle size={15} />
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving...' : 'Add Owner'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
