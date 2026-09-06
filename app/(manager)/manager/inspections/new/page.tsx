'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import { createInspection } from '@/lib/actions/inspection-actions'
import { InspectionStatus } from '@/types'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { units } from '@/lib/mock-data/units'
import { properties } from '@/lib/mock-data/properties'

// Build unit options
const unitOptions = units.map((u) => {
  const property = properties.find((p) => p.id === u.propertyId)
  return { id: u.id, label: `Unit ${u.unitNumber}`, propertyName: property?.name ?? '' }
})

type FormState = { error: string | null; success?: boolean }

async function scheduleInspectionAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const type = formData.get('type') as 'MOVE_IN' | 'MOVE_OUT' | 'PERIODIC'
  const unitId = formData.get('unitId') as string
  const scheduledDate = formData.get('scheduledDate') as string
  const scheduledTime = formData.get('scheduledTime') as string
  const conductedBy = formData.get('conductedBy') as string
  const notes = formData.get('notes') as string

  if (!type || !unitId || !scheduledDate) {
    return { error: 'Please fill in all required fields.' }
  }

  let scheduledAt: Date
  if (scheduledTime) {
    scheduledAt = new Date(`${scheduledDate}T${scheduledTime}:00`)
  } else {
    scheduledAt = new Date(scheduledDate)
  }

  const result = await createInspection({
    type,
    unitId,
    scheduledAt,
    conductedBy: conductedBy || 'user_manager_001',
    status: InspectionStatus.SCHEDULED,
    rooms: {},
    notes: notes || undefined,
  })

  if (!result.success) return { error: result.error }
  return { error: null, success: true }
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Scheduling…' : 'Schedule Inspection'}
    </Button>
  )
}

export default function NewInspectionPage() {
  const router = useRouter()
  const [state, formAction] = useActionState(scheduleInspectionAction, { error: null })

  useEffect(() => {
    if (state.success) {
      router.push('/manager/inspections')
    }
  }, [state.success, router])

  return (
    <div>
      <PageHeader title="Schedule Inspection">
        <Link href="/manager/inspections">
          <Button variant="outline">
            <ArrowLeft className="size-4" />
            Back
          </Button>
        </Link>
      </PageHeader>

      <div className="max-w-xl">
        <form action={formAction} className="space-y-5">
          {state.error && (
            <div className="flex items-start gap-2.5 rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3">
              <AlertCircle className="size-4 text-destructive mt-0.5 shrink-0" />
              <p className="text-sm text-destructive">{state.error}</p>
            </div>
          )}

          {/* Type */}
          <div className="space-y-1.5">
            <Label htmlFor="type">
              Inspection Type <span className="text-destructive">*</span>
            </Label>
            <select
              id="type"
              name="type"
              required
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="">Select type…</option>
              <option value="MOVE_IN">Move-In</option>
              <option value="MOVE_OUT">Move-Out</option>
              <option value="PERIODIC">Periodic</option>
            </select>
          </div>

          {/* Unit */}
          <div className="space-y-1.5">
            <Label htmlFor="unitId">
              Unit <span className="text-destructive">*</span>
            </Label>
            <select
              id="unitId"
              name="unitId"
              required
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="">Select unit…</option>
              {unitOptions.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.propertyName} — {u.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="scheduledDate">
                Scheduled Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="scheduledDate"
                name="scheduledDate"
                type="date"
                required
                className="w-full"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="scheduledTime">Time</Label>
              <Input
                id="scheduledTime"
                name="scheduledTime"
                type="time"
                className="w-full"
              />
            </div>
          </div>

          {/* Conducted By */}
          <div className="space-y-1.5">
            <Label htmlFor="conductedBy">Conducted By</Label>
            <Input
              id="conductedBy"
              name="conductedBy"
              placeholder="Property Manager"
              className="w-full"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Any special instructions or context for this inspection…"
              rows={4}
              className="w-full"
            />
          </div>

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
      </div>
    </div>
  )
}
