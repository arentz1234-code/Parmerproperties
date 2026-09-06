'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createVendor, updateVendor } from '@/lib/actions/vendor-actions'
import { VENDOR_TRADES } from '@/lib/constants'
import { Vendor } from '@/types'

const schema = z.object({
  name: z.string().min(1, 'Company name is required'),
  trade: z.string().min(1, 'Trade is required'),
  contactName: z.string().min(1, 'Contact name is required'),
  email: z.string().email('Invalid email').or(z.literal('')).optional(),
  phone: z.string().min(7, 'Phone is required'),
  address: z.string().optional(),
  licenseNumber: z.string().optional(),
  insured: z.boolean(),
  rating: z.coerce.number().min(1).max(5).optional(),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface VendorFormProps {
  vendor?: Vendor
}

export function VendorForm({ vendor }: VendorFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<FormValues, any, FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      name: vendor?.name ?? '',
      trade: vendor?.trade ?? '',
      contactName: vendor?.contactName ?? '',
      email: vendor?.email ?? '',
      phone: vendor?.phone ?? '',
      address: vendor?.address ?? '',
      licenseNumber: vendor?.licenseNumber ?? '',
      insured: vendor?.insured ?? false,
      rating: vendor?.rating ?? undefined,
      notes: vendor?.notes ?? '',
    },
  })

  function onSubmit(values: FormValues) {
    setError(null)
    startTransition(async () => {
      try {
        const payload = {
          name: values.name,
          trade: values.trade,
          contactName: values.contactName,
          email: values.email || undefined,
          phone: values.phone,
          address: values.address || undefined,
          licenseNumber: values.licenseNumber || undefined,
          insured: values.insured,
          rating: values.rating,
          notes: values.notes || undefined,
        }

        const result = vendor
          ? await updateVendor(vendor.id, payload)
          : await createVendor(payload)

        if (!result.success) {
          setError(result.error)
          return
        }

        router.push('/manager/vendors')
        router.refresh()
      } catch {
        setError('Unexpected error occurred.')
      }
    })
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{vendor ? 'Edit Vendor' : 'New Vendor'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Company Name */}
          <div>
            <Label htmlFor="name">Company Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Auburn Plumbing Co."
              className="mt-1"
              {...register('name')}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                <AlertCircle size={11} /> {errors.name.message}
              </p>
            )}
          </div>

          {/* Trade */}
          <div>
            <Label>Trade *</Label>
            <Controller
              control={control}
              name="trade"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="mt-1 w-full">
                    <SelectValue placeholder="Select a trade..." />
                  </SelectTrigger>
                  <SelectContent>
                    {VENDOR_TRADES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.trade && (
              <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                <AlertCircle size={11} /> {errors.trade.message}
              </p>
            )}
          </div>

          {/* Contact Name */}
          <div>
            <Label htmlFor="contactName">Contact Name *</Label>
            <Input
              id="contactName"
              placeholder="Primary contact person"
              className="mt-1"
              {...register('contactName')}
              aria-invalid={!!errors.contactName}
            />
            {errors.contactName && (
              <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                <AlertCircle size={11} /> {errors.contactName.message}
              </p>
            )}
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="vendor@example.com"
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
            <div>
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(334) 555-0000"
                className="mt-1"
                {...register('phone')}
                aria-invalid={!!errors.phone}
              />
              {errors.phone && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                  <AlertCircle size={11} /> {errors.phone.message}
                </p>
              )}
            </div>
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

          {/* License & Rating */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="licenseNumber">License Number</Label>
              <Input
                id="licenseNumber"
                placeholder="AL-PLB-00000"
                className="mt-1"
                {...register('licenseNumber')}
              />
            </div>
            <div>
              <Label>Rating (1–5)</Label>
              <Controller
                control={control}
                name="rating"
                render={({ field }) => (
                  <Select
                    value={field.value?.toString() ?? null}
                    onValueChange={(v) => field.onChange(v ? Number(v) : undefined)}
                  >
                    <SelectTrigger className="mt-1 w-full">
                      <SelectValue placeholder="Select rating..." />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((r) => (
                        <SelectItem key={r} value={String(r)}>
                          {'★'.repeat(r)}{'☆'.repeat(5 - r)} ({r})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          {/* Insured Toggle */}
          <div className="flex items-center gap-3">
            <Controller
              control={control}
              name="insured"
              render={({ field }) => (
                <Switch
                  id="insured"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor="insured" className="cursor-pointer">
              Insured / Has liability insurance
            </Label>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Preferred availability, pricing notes, etc."
              className="mt-1"
              rows={3}
              {...register('notes')}
            />
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
              {isPending ? 'Saving...' : vendor ? 'Save Changes' : 'Add Vendor'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
