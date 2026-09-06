'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod/v4'
import { cn } from 'cn'
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
import { createProperty, updateProperty } from '@/lib/actions/property-actions'
import { PROPERTY_TYPES } from '@/lib/constants'
import type { Property } from '@/types'

const propertySchema = z.object({
  name: z.string().min(1, 'Property name is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zip: z.string().min(5, 'ZIP code is required'),
  type: z.enum(['APARTMENT', 'HOUSE', 'COMMERCIAL', 'CONDO', 'TOWNHOUSE']),
  description: z.string().optional(),
  yearBuilt: z.coerce.number().int().min(1800).max(2100).optional().or(z.literal('')),
})

type PropertyFormData = z.infer<typeof propertySchema>

interface PropertyFormProps {
  property?: Property
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1 text-xs text-red-600">{message}</p>
}

export function PropertyForm({ property }: PropertyFormProps) {
  const router = useRouter()
  const isEditing = !!property

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<PropertyFormData, any, PropertyFormData>({
    resolver: zodResolver(propertySchema) as any,
    defaultValues: {
      name: property?.name ?? '',
      address: property?.address ?? '',
      city: property?.city ?? '',
      state: property?.state ?? '',
      zip: property?.zip ?? '',
      type: (property?.type as PropertyFormData['type']) ?? 'APARTMENT',
      description: property?.description ?? '',
      yearBuilt: property?.yearBuilt ?? '',
    },
  })

  const selectedType = watch('type')

  async function onSubmit(data: PropertyFormData) {
    try {
      const payload = {
        name: data.name,
        address: data.address,
        city: data.city,
        state: data.state,
        zip: data.zip,
        type: data.type as Property['type'],
        description: data.description ?? undefined,
        yearBuilt: data.yearBuilt !== '' && data.yearBuilt !== undefined
          ? Number(data.yearBuilt)
          : undefined,
      }

      let result
      if (isEditing && property) {
        result = await updateProperty(property.id, payload)
      } else {
        result = await createProperty(payload)
      }

      if (!result.success) {
        alert(result.error ?? 'Something went wrong.')
        return
      }

      router.push('/manager/properties')
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
        {/* Property Name */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">
            Property Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            placeholder="e.g. Richland Village"
            aria-invalid={!!errors.name}
            {...register('name')}
          />
          <FieldError message={errors.name?.message} />
        </div>

        {/* Address */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="address">
            Street Address <span className="text-red-500">*</span>
          </Label>
          <Input
            id="address"
            placeholder="123 Main St"
            aria-invalid={!!errors.address}
            {...register('address')}
          />
          <FieldError message={errors.address?.message} />
        </div>

        {/* City / State / Zip */}
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5 col-span-1">
            <Label htmlFor="city">
              City <span className="text-red-500">*</span>
            </Label>
            <Input
              id="city"
              placeholder="Auburn"
              aria-invalid={!!errors.city}
              {...register('city')}
            />
            <FieldError message={errors.city?.message} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="state">
              State <span className="text-red-500">*</span>
            </Label>
            <Input
              id="state"
              placeholder="AL"
              maxLength={2}
              aria-invalid={!!errors.state}
              {...register('state')}
            />
            <FieldError message={errors.state?.message} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="zip">
              ZIP <span className="text-red-500">*</span>
            </Label>
            <Input
              id="zip"
              placeholder="36830"
              aria-invalid={!!errors.zip}
              {...register('zip')}
            />
            <FieldError message={errors.zip?.message} />
          </div>
        </div>

        {/* Property Type */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="type">
            Property Type <span className="text-red-500">*</span>
          </Label>
          <Select
            value={selectedType}
            onValueChange={(val) => setValue('type', val as PropertyFormData['type'], { shouldValidate: true })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {PROPERTY_TYPES.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError message={errors.type?.message} />
        </div>

        {/* Year Built */}
        <div className="flex flex-col gap-1.5 max-w-40">
          <Label htmlFor="yearBuilt">Year Built</Label>
          <Input
            id="yearBuilt"
            type="number"
            placeholder="2020"
            min={1800}
            max={2100}
            {...register('yearBuilt')}
          />
          <FieldError message={errors.yearBuilt?.message} />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            rows={4}
            placeholder="Describe the property..."
            {...register('description')}
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
            {isSubmitting ? 'Saving…' : isEditing ? 'Save Changes' : 'Add Property'}
          </Button>
        </div>
      </div>
    </form>
  )
}
