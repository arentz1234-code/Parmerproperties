'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AlertCircle, Upload, FileText } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createDocument } from '@/lib/actions/document-actions'
import { DOCUMENT_CATEGORIES } from '@/lib/constants'
import { DocumentCategory } from '@/types'

const schema = z.object({
  name: z.string().min(1, 'Document name is required'),
  category: z.nativeEnum(DocumentCategory),
  propertyId: z.string().optional(),
  unitId: z.string().optional(),
  tenantId: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export default function NewDocumentPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      propertyId: '',
      unitId: '',
      tenantId: '',
    },
  })

  function onSubmit(values: FormValues) {
    setError(null)
    startTransition(async () => {
      try {
        const result = await createDocument({
          name: values.name,
          category: values.category,
          mimeType: 'application/pdf',
          propertyId: values.propertyId || undefined,
          unitId: values.unitId || undefined,
          tenantId: values.tenantId || undefined,
          uploadedBy: 'user_manager_001',
        })
        if (!result.success) {
          setError(result.error)
          return
        }
        router.push('/manager/documents')
        router.refresh()
      } catch {
        setError('Unexpected error occurred.')
      }
    })
  }

  return (
    <div>
      <PageHeader title="Upload Document" description="Add a document to the library" />

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Document Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Document Name */}
            <div>
              <Label htmlFor="name">Document Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Lease Agreement — Unit 101"
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

            {/* Category */}
            <div>
              <Label>Category *</Label>
              <Controller
                control={control}
                name="category"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="mt-1 w-full">
                      <SelectValue placeholder="Select a category..." />
                    </SelectTrigger>
                    <SelectContent>
                      {DOCUMENT_CATEGORIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.category && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                  <AlertCircle size={11} /> {errors.category.message}
                </p>
              )}
            </div>

            {/* Associations */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="propertyId">Property ID (optional)</Label>
                <Input
                  id="propertyId"
                  placeholder="prop_..."
                  className="mt-1"
                  {...register('propertyId')}
                />
              </div>
              <div>
                <Label htmlFor="unitId">Unit ID (optional)</Label>
                <Input
                  id="unitId"
                  placeholder="unit_..."
                  className="mt-1"
                  {...register('unitId')}
                />
              </div>
              <div>
                <Label htmlFor="tenantId">Tenant ID (optional)</Label>
                <Input
                  id="tenantId"
                  placeholder="tenant_..."
                  className="mt-1"
                  {...register('tenantId')}
                />
              </div>
            </div>

            {/* Mock File Upload */}
            <div>
              <Label>File</Label>
              <div className="mt-1 flex items-center gap-3 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-5">
                <div className="flex size-10 items-center justify-center rounded-lg bg-white ring-1 ring-gray-200">
                  <FileText size={18} className="text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">document.pdf</p>
                  <p className="text-xs text-gray-500">File upload mocked — PDF, 2.4 MB</p>
                </div>
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Upload size={11} />
                  Choose File
                </button>
              </div>
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
                {isPending ? 'Saving...' : 'Save Document'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
