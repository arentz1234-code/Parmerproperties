'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AlertCircle, ChevronRight, ChevronLeft, Check } from 'lucide-react'
import { cn } from 'cn'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createLease } from '@/lib/actions/lease-actions'
import { LeaseStatus } from '@/types'
import type { Unit, Tenant, Property } from '@/types'

// ─── Schema ───────────────────────────────────────────────────────────────────

const leaseSchema = z.object({
  unitId: z.string().min(1, 'Please select a unit'),
  tenantId: z.string().min(1, 'Please select a tenant'),
  startDate: z.string().min(1, 'Start date required'),
  endDate: z.string().min(1, 'End date required'),
  rentAmount: z.coerce.number().positive('Rent must be positive'),
  deposit: z.coerce.number().nonnegative('Deposit must be 0 or more'),
  petDeposit: z.coerce.number().nonnegative().optional(),
  petAllowed: z.boolean().default(false),
  notes: z.string().optional(),
})

type LeaseFormValues = z.infer<typeof leaseSchema>

// ─── Steps ────────────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: 'Select Unit & Tenant' },
  { id: 2, label: 'Dates & Financials' },
  { id: 3, label: 'Policies & Notes' },
]

// ─── Progress Indicator ───────────────────────────────────────────────────────

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="mb-8 flex items-center gap-0">
      {STEPS.map((step, idx) => (
        <div key={step.id} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                'flex size-8 items-center justify-center rounded-full text-sm font-semibold transition-all',
                step.id < current
                  ? 'bg-green-500 text-white'
                  : step.id === current
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-500',
              )}
            >
              {step.id < current ? <Check size={14} /> : step.id}
            </div>
            <span
              className={cn(
                'mt-1.5 text-xs font-medium whitespace-nowrap',
                step.id === current ? 'text-blue-600' : 'text-gray-400',
              )}
            >
              {step.label}
            </span>
          </div>
          {idx < STEPS.length - 1 && (
            <div
              className={cn(
                'mb-5 h-px w-16 sm:w-24 transition-colors',
                step.id < current ? 'bg-green-400' : 'bg-gray-200',
              )}
            />
          )}
        </div>
      ))}
    </div>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
      <AlertCircle size={11} />
      {message}
    </p>
  )
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface LeaseFormProps {
  vacantUnits: (Unit & { property: Property })[]
  tenants: Tenant[]
}

// ─── Component ────────────────────────────────────────────────────────────────

export function LeaseForm({ vacantUnits, tenants }: LeaseFormProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    watch,
    trigger,
    formState: { errors },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<LeaseFormValues, any, LeaseFormValues>({
    resolver: zodResolver(leaseSchema) as any,
    defaultValues: {
      unitId: '',
      tenantId: '',
      startDate: '',
      endDate: '',
      rentAmount: 0,
      deposit: 0,
      petDeposit: 0,
      petAllowed: false,
      notes: '',
    },
  })

  const watchedUnitId = watch('unitId')
  const selectedUnit = vacantUnits.find((u) => u.id === watchedUnitId)
  const petAllowed = watch('petAllowed')

  // Validate current step fields before advancing
  async function nextStep() {
    const stepFields: Record<number, (keyof LeaseFormValues)[]> = {
      1: ['unitId', 'tenantId'],
      2: ['startDate', 'endDate', 'rentAmount', 'deposit'],
    }
    const valid = await trigger(stepFields[step])
    if (valid) setStep((s) => Math.min(s + 1, 3))
  }

  async function onSubmit(values: LeaseFormValues) {
    setSubmitting(true)
    setError(null)
    try {
      const result = await createLease({
        unitId: values.unitId,
        tenantId: values.tenantId,
        startDate: new Date(values.startDate),
        endDate: new Date(values.endDate),
        rentAmount: values.rentAmount,
        deposit: values.deposit,
        petDeposit: values.petAllowed ? (values.petDeposit ?? 0) : undefined,
        petAllowed: values.petAllowed,
        status: LeaseStatus.ACTIVE,
        notes: values.notes,
        signedAt: new Date(),
      })
      if (!result.success) {
        setError(result.error)
        return
      }
      router.push('/manager/leases')
      router.refresh()
    } catch (e) {
      setError('Unexpected error occurred.')
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl">
      <StepIndicator current={step} />

      {/* Step 1 */}
      {step === 1 && (
        <Card>
          <CardContent className="pt-6 space-y-5">
            <div>
              <Label>Unit *</Label>
              <p className="text-xs text-gray-500 mb-1.5">Only vacant units are shown</p>
              <Controller
                control={control}
                name="unitId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full mt-1" aria-invalid={!!errors.unitId}>
                      <SelectValue placeholder="Select a vacant unit..." />
                    </SelectTrigger>
                    <SelectContent>
                      {vacantUnits.map((unit) => (
                        <SelectItem key={unit.id} value={unit.id}>
                          {unit.property.name} — Unit {unit.unitNumber} ({unit.bedrooms}bd /{' '}
                          {unit.bathrooms}ba) — ${unit.rentAmount.toLocaleString()}/mo
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError message={errors.unitId?.message} />
            </div>

            {selectedUnit && (
              <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm">
                <p className="font-medium text-blue-900">{selectedUnit.property.name}</p>
                <p className="text-blue-700">
                  Unit {selectedUnit.unitNumber} — {selectedUnit.bedrooms}bd / {selectedUnit.bathrooms}ba
                  {selectedUnit.sqft ? `, ${selectedUnit.sqft.toLocaleString()} sqft` : ''}
                </p>
              </div>
            )}

            <div>
              <Label>Tenant *</Label>
              <Controller
                control={control}
                name="tenantId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full mt-1" aria-invalid={!!errors.tenantId}>
                      <SelectValue placeholder="Select a tenant..." />
                    </SelectTrigger>
                    <SelectContent>
                      {tenants.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.firstName} {t.lastName} — {t.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError message={errors.tenantId?.message} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <Card>
          <CardContent className="pt-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  className="mt-1"
                  {...register('startDate')}
                  aria-invalid={!!errors.startDate}
                />
                <FieldError message={errors.startDate?.message} />
              </div>
              <div>
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  className="mt-1"
                  {...register('endDate')}
                  aria-invalid={!!errors.endDate}
                />
                <FieldError message={errors.endDate?.message} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rentAmount">Monthly Rent ($) *</Label>
                <Input
                  id="rentAmount"
                  type="number"
                  min={0}
                  step={50}
                  className="mt-1"
                  defaultValue={selectedUnit?.rentAmount ?? 0}
                  {...register('rentAmount')}
                  aria-invalid={!!errors.rentAmount}
                />
                <FieldError message={errors.rentAmount?.message} />
              </div>
              <div>
                <Label htmlFor="deposit">Security Deposit ($) *</Label>
                <Input
                  id="deposit"
                  type="number"
                  min={0}
                  step={50}
                  className="mt-1"
                  defaultValue={selectedUnit?.deposit ?? 0}
                  {...register('deposit')}
                  aria-invalid={!!errors.deposit}
                />
                <FieldError message={errors.deposit?.message} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <Card>
          <CardContent className="pt-6 space-y-5">
            <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-900">Pet Allowed</p>
                <p className="text-xs text-gray-500">Allow tenant to have pets</p>
              </div>
              <Controller
                control={control}
                name="petAllowed"
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>

            {petAllowed && (
              <div>
                <Label htmlFor="petDeposit">Pet Deposit ($)</Label>
                <Input
                  id="petDeposit"
                  type="number"
                  min={0}
                  step={50}
                  className="mt-1"
                  {...register('petDeposit')}
                />
              </div>
            )}

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any special terms, conditions, or notes for this lease..."
                className="mt-1"
                rows={4}
                {...register('notes')}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={15} />
          {error}
        </div>
      )}

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => (step > 1 ? setStep((s) => s - 1) : router.back())}
          disabled={submitting}
        >
          <ChevronLeft size={14} />
          {step === 1 ? 'Cancel' : 'Back'}
        </Button>

        {step < 3 ? (
          <Button type="button" onClick={nextStep}>
            Next
            <ChevronRight size={14} />
          </Button>
        ) : (
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Creating Lease...' : 'Create Lease'}
          </Button>
        )}
      </div>
    </form>
  )
}
