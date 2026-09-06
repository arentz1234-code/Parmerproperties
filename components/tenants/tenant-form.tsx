'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2, User, Phone, Mail, Calendar, AlertCircle } from 'lucide-react'
import { cn } from 'cn'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createTenant, updateTenant } from '@/lib/actions/tenant-actions'
import type { Tenant } from '@/types'

// ─── Schema ───────────────────────────────────────────────────────────────────

const emergencyContactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(7, 'Valid phone required'),
  relationship: z.string().min(1, 'Relationship is required'),
})

const tenantFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(7, 'Valid phone required'),
  dateOfBirth: z.string().optional(),
  emergencyContacts: z.array(emergencyContactSchema),
  notes: z.string().optional(),
})

type TenantFormValues = z.infer<typeof tenantFormSchema>

// ─── Props ────────────────────────────────────────────────────────────────────

interface TenantFormProps {
  tenant?: Tenant
  mode?: 'create' | 'edit'
}

// ─── Field Error ──────────────────────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="flex items-center gap-1 text-xs text-red-600 mt-1">
      <AlertCircle size={12} />
      {message}
    </p>
  )
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="flex size-7 items-center justify-center rounded-lg bg-blue-50">
        <Icon size={14} className="text-blue-600" />
      </div>
      <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TenantForm({ tenant, mode = 'create' }: TenantFormProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TenantFormValues>({
    resolver: zodResolver(tenantFormSchema),
    defaultValues: {
      firstName: tenant?.firstName ?? '',
      lastName: tenant?.lastName ?? '',
      email: tenant?.email ?? '',
      phone: tenant?.phone ?? '',
      dateOfBirth: tenant?.dateOfBirth
        ? new Date(tenant.dateOfBirth).toISOString().split('T')[0]
        : '',
      emergencyContacts: (tenant?.emergencyContacts as { name: string; phone: string; relationship: string }[]) ?? [
        { name: '', phone: '', relationship: '' },
      ],
      notes: '',
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'emergencyContacts',
  })

  async function onSubmit(values: TenantFormValues) {
    setSubmitting(true)
    setError(null)

    try {
      const payload = {
        userId: tenant?.userId ?? `user_${Date.now()}`,
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        dateOfBirth: values.dateOfBirth ? new Date(values.dateOfBirth) : undefined,
        emergencyContacts: values.emergencyContacts,
      }

      let result
      if (mode === 'edit' && tenant) {
        result = await updateTenant(tenant.id, payload)
      } else {
        result = await createTenant(payload)
      }

      if (!result.success) {
        setError(result.error)
        return
      }

      router.push('/manager/tenants')
      router.refresh()
    } catch (e) {
      setError('An unexpected error occurred. Please try again.')
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
      {/* Personal Info */}
      <Card>
        <CardHeader>
          <CardTitle>
            <SectionHeader icon={User} title="Personal Information" />
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              placeholder="Sarah"
              className="mt-1"
              {...register('firstName')}
              aria-invalid={!!errors.firstName}
            />
            <FieldError message={errors.firstName?.message} />
          </div>

          <div>
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              placeholder="Mitchell"
              className="mt-1"
              {...register('lastName')}
              aria-invalid={!!errors.lastName}
            />
            <FieldError message={errors.lastName?.message} />
          </div>

          <div>
            <Label htmlFor="email">Email Address *</Label>
            <div className="relative mt-1">
              <Mail size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <Input
                id="email"
                type="email"
                placeholder="sarah@example.com"
                className="pl-8"
                {...register('email')}
                aria-invalid={!!errors.email}
              />
            </div>
            <FieldError message={errors.email?.message} />
          </div>

          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <div className="relative mt-1">
              <Phone size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <Input
                id="phone"
                type="tel"
                placeholder="(334) 555-0201"
                className="pl-8"
                {...register('phone')}
                aria-invalid={!!errors.phone}
              />
            </div>
            <FieldError message={errors.phone?.message} />
          </div>

          <div>
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <div className="relative mt-1">
              <Calendar size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <Input
                id="dateOfBirth"
                type="date"
                className="pl-8"
                {...register('dateOfBirth')}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contacts */}
      <Card>
        <CardHeader>
          <CardTitle>
            <SectionHeader icon={Phone} title="Emergency Contacts" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className={cn(
                'rounded-lg border border-gray-200 bg-gray-50/50 p-4',
                index > 0 && 'relative'
              )}
            >
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="absolute right-3 top-3 flex size-6 items-center justify-center rounded-md text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              )}

              <p className="mb-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                Contact {index + 1}
              </p>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <Label htmlFor={`emergencyContacts.${index}.name`}>Name *</Label>
                  <Input
                    id={`emergencyContacts.${index}.name`}
                    placeholder="Karen Mitchell"
                    className="mt-1"
                    {...register(`emergencyContacts.${index}.name`)}
                    aria-invalid={!!errors.emergencyContacts?.[index]?.name}
                  />
                  <FieldError message={errors.emergencyContacts?.[index]?.name?.message} />
                </div>

                <div>
                  <Label htmlFor={`emergencyContacts.${index}.phone`}>Phone *</Label>
                  <Input
                    id={`emergencyContacts.${index}.phone`}
                    type="tel"
                    placeholder="(205) 555-0801"
                    className="mt-1"
                    {...register(`emergencyContacts.${index}.phone`)}
                    aria-invalid={!!errors.emergencyContacts?.[index]?.phone}
                  />
                  <FieldError message={errors.emergencyContacts?.[index]?.phone?.message} />
                </div>

                <div>
                  <Label htmlFor={`emergencyContacts.${index}.relationship`}>
                    Relationship *
                  </Label>
                  <Input
                    id={`emergencyContacts.${index}.relationship`}
                    placeholder="Mother"
                    className="mt-1"
                    {...register(`emergencyContacts.${index}.relationship`)}
                    aria-invalid={!!errors.emergencyContacts?.[index]?.relationship}
                  />
                  <FieldError
                    message={errors.emergencyContacts?.[index]?.relationship?.message}
                  />
                </div>
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ name: '', phone: '', relationship: '' })}
            className="gap-1.5"
          >
            <Plus size={14} />
            Add Emergency Contact
          </Button>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardContent className="pt-4">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Any additional notes about this tenant..."
            className="mt-1"
            rows={3}
            {...register('notes')}
          />
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting
            ? mode === 'edit'
              ? 'Saving...'
              : 'Creating...'
            : mode === 'edit'
            ? 'Save Changes'
            : 'Create Tenant'}
        </Button>
      </div>
    </form>
  )
}
