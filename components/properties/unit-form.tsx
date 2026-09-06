'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod/v4'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createUnit, updateUnit } from '@/lib/actions/unit-actions'
import type { Unit, UnitStatus } from '@/types'

const unitSchema = z.object({
  unitNumber: z.string().min(1, 'Unit number is required'),
  bedrooms: z.coerce.number().int().min(0, 'Must be 0 or more'),
  bathrooms: z.coerce.number().min(0, 'Must be 0 or more'),
  sqft: z.coerce.number().int().positive().optional().or(z.literal('')),
  rentAmount: z.coerce.number().positive('Rent amount is required'),
  deposit: z.coerce.number().min(0).optional().or(z.literal('')),
  status: z.enum(['VACANT', 'OCCUPIED', 'NOTICE', 'MAINTENANCE']),
  floor: z.coerce.number().int().positive().optional().or(z.literal('')),
  notes: z.string().optional(),
})

type UnitFormData = z.infer<typeof unitSchema>

interface UnitFormProps {
  propertyId: string
  unit?: Unit
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1 text-xs text-red-600">{message}</p>
}

const UNIT_STATUS_OPTIONS = [
  { value: 'VACANT', label: 'Vacant' },
  { value: 'OCCUPIED', label: 'Occupied' },
  { value: 'NOTICE', label: 'Notice Given' },
  { value: 'MAINTENANCE', label: 'Under Maintenance' },
]

export function UnitForm({ propertyId, unit }: UnitFormProps) {
  const router = useRouter()
  const isEditing = !!unit

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<UnitFormData, any, UnitFormData>({
    resolver: zodResolver(unitSchema) as any,
    defaultValues: {
      unitNumber: unit?.unitNumber ?? '',
      bedrooms: unit?.bedrooms ?? 1,
      bathrooms: unit?.bathrooms ?? 1,
      sqft: unit?.sqft ?? '',
      rentAmount: unit?.rentAmount ?? 0,
      deposit: unit?.deposit ?? '',
      status: (unit?.status as UnitFormData['status']) ?? 'VACANT',
      floor: unit?.floor ?? '',
      notes: unit?.notes ?? '',
    },
  })

  const selectedStatus = watch('status')

  async function onSubmit(data: UnitFormData) {
    try {
      const payload = {
        propertyId,
        unitNumber: data.unitNumber,
        bedrooms: Number(data.bedrooms),
        bathrooms: Number(data.bathrooms),
        sqft: data.sqft !== '' && data.sqft !== undefined ? Number(data.sqft) : undefined,
        rentAmount: Number(data.rentAmount),
        deposit: data.deposit !== '' && data.deposit !== undefined ? Number(data.deposit) : undefined,
        status: data.status as UnitStatus,
        floor: data.floor !== '' && data.floor !== undefined ? Number(data.floor) : undefined,
        notes: data.notes || undefined,
      }

      let result
      if (isEditing && unit) {
        result = await updateUnit(unit.id, payload)
      } else {
        result = await createUnit(payload)
      }

      if (!result.success) {
        alert(result.error ?? 'Something went wrong.')
        return
      }

      router.push(`/manager/properties/${propertyId}`)
      router.refresh()
    } catch {
      alert('An unexpected error occurred. Please try again.')
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200"
    >
      <div className="flex flex-col gap-6">
        {/* Unit Number */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="unitNumber">
            Unit Number <span className="text-red-500">*</span>
          </Label>
          <Input
            id="unitNumber"
            placeholder="e.g. 101, A2, 3B"
            className="max-w-48"
            aria-invalid={!!errors.unitNumber}
            {...register('unitNumber')}
          />
          <FieldError message={errors.unitNumber?.message} />
        </div>

        {/* Bedrooms / Bathrooms */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bedrooms">Bedrooms</Label>
            <Input
              id="bedrooms"
              type="number"
              min={0}
              aria-invalid={!!errors.bedrooms}
              {...register('bedrooms')}
            />
            <FieldError message={errors.bedrooms?.message} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bathrooms">Bathrooms</Label>
            <Input
              id="bathrooms"
              type="number"
              min={0}
              step={0.5}
              aria-invalid={!!errors.bathrooms}
              {...register('bathrooms')}
            />
            <FieldError message={errors.bathrooms?.message} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sqft">Sqft</Label>
            <Input
              id="sqft"
              type="number"
              min={0}
              placeholder="1200"
              {...register('sqft')}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="floor">Floor</Label>
            <Input
              id="floor"
              type="number"
              min={1}
              placeholder="1"
              {...register('floor')}
            />
          </div>
        </div>

        {/* Rent + Deposit */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rentAmount">
              Monthly Rent <span className="text-red-500">*</span>
            </Label>
            <Input
              id="rentAmount"
              type="number"
              min={0}
              step={50}
              placeholder="1500"
              aria-invalid={!!errors.rentAmount}
              {...register('rentAmount')}
            />
            <FieldError message={errors.rentAmount?.message} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="deposit">Deposit</Label>
            <Input
              id="deposit"
              type="number"
              min={0}
              step={50}
              placeholder="1500"
              {...register('deposit')}
            />
          </div>
        </div>

        {/* Status */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="status">Status</Label>
          <Select
            value={selectedStatus}
            onValueChange={(val) =>
              setValue('status', val as UnitFormData['status'], { shouldValidate: true })
            }
          >
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {UNIT_STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError message={errors.status?.message} />
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            rows={3}
            placeholder="Floor plan name, special features, etc."
            {...register('notes')}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : isEditing ? 'Save Changes' : 'Add Unit'}
          </Button>
        </div>
      </div>
    </form>
  )
}
