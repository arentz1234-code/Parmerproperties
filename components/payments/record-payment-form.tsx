'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AlertCircle, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { recordPayment } from '@/lib/actions/payment-actions'
import { PaymentMethod } from '@/types'
import { PAYMENT_METHODS } from '@/lib/constants'
import { formatCurrency } from '@/lib/utils'

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  leaseId: z.string().min(1, 'Lease is required'),
  tenantId: z.string().min(1),
  amount: z.coerce.number().positive('Amount must be positive'),
  method: z.nativeEnum(PaymentMethod),
  paymentDate: z.string().optional(),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

// ─── Props ────────────────────────────────────────────────────────────────────

export interface LeaseOption {
  leaseId: string
  tenantId: string
  tenantName: string
  propertyUnit: string
  rentAmount: number
}

interface RecordPaymentFormProps {
  leases: LeaseOption[]
  defaultLeaseId?: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RecordPaymentForm({ leases, defaultLeaseId }: RecordPaymentFormProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const defaultLease = leases.find((l) => l.leaseId === defaultLeaseId) ?? leases[0]

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<FormValues, any, FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      leaseId: defaultLease?.leaseId ?? '',
      tenantId: defaultLease?.tenantId ?? '',
      amount: defaultLease?.rentAmount ?? 0,
      method: PaymentMethod.ONLINE,
      paymentDate: new Date().toISOString().split('T')[0],
      referenceNumber: '',
      notes: '',
    },
  })

  const watchedLeaseId = watch('leaseId')
  const selectedLease = leases.find((l) => l.leaseId === watchedLeaseId)

  function handleLeaseChange(leaseId: string) {
    const lease = leases.find((l) => l.leaseId === leaseId)
    if (lease) {
      setValue('leaseId', lease.leaseId)
      setValue('tenantId', lease.tenantId)
      setValue('amount', lease.rentAmount)
    }
  }

  async function onSubmit(values: FormValues) {
    setSubmitting(true)
    setError(null)
    try {
      const result = await recordPayment({
        leaseId: values.leaseId,
        tenantId: values.tenantId,
        amount: values.amount,
        method: values.method,
        notes: values.notes,
      })
      if (!result.success) {
        setError(result.error)
        return
      }
      setSuccess(true)
      router.push('/manager/payments')
      router.refresh()
    } catch (e) {
      setError('Unexpected error occurred.')
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 px-6 py-8 text-center">
        <p className="text-base font-semibold text-green-700">Payment recorded successfully!</p>
        <p className="mt-1 text-sm text-green-600">Redirecting to payments...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl space-y-5">
      {/* Lease Select */}
      <div>
        <Label>Lease / Tenant *</Label>
        <Controller
          control={control}
          name="leaseId"
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={(val) => {
                field.onChange(val ?? '')
                handleLeaseChange(val ?? '')
              }}
            >
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Select a lease..." />
              </SelectTrigger>
              <SelectContent>
                {leases.map((l) => (
                  <SelectItem key={l.leaseId} value={l.leaseId}>
                    {l.tenantName} — {l.propertyUnit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.leaseId && (
          <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
            <AlertCircle size={11} /> {errors.leaseId.message}
          </p>
        )}
        {selectedLease && (
          <p className="mt-1 text-xs text-gray-500">
            Monthly rent: <strong>{formatCurrency(selectedLease.rentAmount)}</strong>
          </p>
        )}
      </div>

      {/* Amount */}
      <div>
        <Label htmlFor="amount">Amount ($) *</Label>
        <div className="relative mt-1">
          <DollarSign
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <Input
            id="amount"
            type="number"
            min={0}
            step={0.01}
            className="pl-8"
            {...register('amount')}
            aria-invalid={!!errors.amount}
          />
        </div>
        {errors.amount && (
          <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
            <AlertCircle size={11} /> {errors.amount.message}
          </p>
        )}
      </div>

      {/* Payment Method */}
      <div>
        <Label>Payment Method *</Label>
        <Controller
          control={control}
          name="method"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Select method..." />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.method && (
          <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
            <AlertCircle size={11} /> {errors.method.message}
          </p>
        )}
      </div>

      {/* Payment Date */}
      <div>
        <Label htmlFor="paymentDate">Payment Date</Label>
        <Input
          id="paymentDate"
          type="date"
          className="mt-1"
          {...register('paymentDate')}
        />
      </div>

      {/* Reference Number */}
      <div>
        <Label htmlFor="referenceNumber">Reference Number</Label>
        <Input
          id="referenceNumber"
          placeholder="Check #, transaction ID, etc."
          className="mt-1"
          {...register('referenceNumber')}
        />
      </div>

      {/* Notes */}
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Any notes about this payment..."
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
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Recording...' : 'Record Payment'}
        </Button>
      </div>
    </form>
  )
}
