'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { createMaintenanceRequest } from '@/lib/actions/maintenance-actions'
import { MaintenancePriority, MaintenanceStatus, Vendor } from '@/types'
import { MAINTENANCE_CATEGORIES } from '@/lib/constants'
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
import { AlertCircle } from 'lucide-react'

interface UnitOption {
  id: string
  label: string
  propertyName: string
}

interface Props {
  units: UnitOption[]
  vendors: Vendor[]
}

type FormState = { error: string | null; success?: boolean }

async function createRequestAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const unitId = formData.get('unitId') as string
  const priority = formData.get('priority') as MaintenancePriority
  const category = formData.get('category') as string
  const vendorId = formData.get('vendorId') as string | null

  if (!title || !description || !unitId || !priority || !category) {
    return { error: 'Please fill in all required fields.' }
  }

  const result = await createMaintenanceRequest({
    title,
    description,
    unitId,
    priority,
    category,
    status: MaintenanceStatus.OPEN,
    requestedBy: 'user_manager_001',
    vendorId: vendorId || undefined,
    notes: formData.get('notes') as string || undefined,
    estimatedCost: formData.get('estimatedCost')
      ? Number(formData.get('estimatedCost'))
      : undefined,
  })

  if (!result.success) return { error: result.error }
  return { error: null, success: true }
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Submitting…' : 'Submit Request'}
    </Button>
  )
}

export function MaintenanceRequestForm({ units, vendors }: Props) {
  const router = useRouter()
  const [state, formAction] = useActionState(createRequestAction, { error: null })

  useEffect(() => {
    if (state.success) {
      router.push('/maintenance')
    }
  }, [state.success, router])

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <div className="flex items-start gap-2.5 rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3">
          <AlertCircle className="size-4 text-destructive mt-0.5 shrink-0" />
          <p className="text-sm text-destructive">{state.error}</p>
        </div>
      )}

      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
        <Input
          id="title"
          name="title"
          placeholder="Brief description of the issue"
          required
          className="w-full"
        />
      </div>

      {/* Unit */}
      <div className="space-y-1.5">
        <Label htmlFor="unitId">Unit <span className="text-destructive">*</span></Label>
        <select
          id="unitId"
          name="unitId"
          required
          className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="">Select a unit…</option>
          {units.map((u) => (
            <option key={u.id} value={u.id}>
              {u.propertyName} — {u.label}
            </option>
          ))}
        </select>
      </div>

      {/* Priority + Category */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="priority">Priority <span className="text-destructive">*</span></Label>
          <select
            id="priority"
            name="priority"
            required
            defaultValue="MEDIUM"
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value={MaintenancePriority.EMERGENCY}>Emergency</option>
            <option value={MaintenancePriority.HIGH}>High</option>
            <option value={MaintenancePriority.MEDIUM}>Medium</option>
            <option value={MaintenancePriority.LOW}>Low</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="category">Category <span className="text-destructive">*</span></Label>
          <select
            id="category"
            name="category"
            required
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="">Select…</option>
            {MAINTENANCE_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="description">
          Description <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Describe the issue in detail — what happened, when it started, any steps already taken…"
          required
          rows={5}
          className="w-full"
        />
      </div>

      {/* Estimated Cost */}
      <div className="space-y-1.5">
        <Label htmlFor="estimatedCost">Estimated Cost (optional)</Label>
        <div className="relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
          <Input
            id="estimatedCost"
            name="estimatedCost"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            className="pl-6 w-full"
          />
        </div>
      </div>

      {/* Assign Vendor */}
      <div className="space-y-1.5">
        <Label htmlFor="vendorId">Assign Vendor (optional)</Label>
        <select
          id="vendorId"
          name="vendorId"
          className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="">Unassigned</option>
          {vendors.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name} — {v.trade}
            </option>
          ))}
        </select>
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <Label htmlFor="notes">Internal Notes (optional)</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Any additional context for the management team…"
          rows={3}
          className="w-full"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2 border-t border-border">
        <SubmitButton />
        <Button
          type="button"
          variant="outline"
          onClick={() => history.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
