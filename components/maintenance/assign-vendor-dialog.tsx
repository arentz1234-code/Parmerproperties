'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { UserCheck, AlertCircle } from 'lucide-react'
import { assignVendor } from '@/lib/actions/maintenance-actions'
import { Vendor } from '@/types'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface Props {
  requestId: string
  vendors: Vendor[]
  defaultOpen?: boolean
  label?: string
  variant?: 'default' | 'outline' | 'ghost'
}

type FormState = { error: string | null; success?: boolean }

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Assigning…' : 'Assign Vendor'}
    </Button>
  )
}

export function AssignVendorDialog({
  requestId,
  vendors,
  defaultOpen = false,
  label = 'Assign Vendor',
  variant = 'default',
}: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(defaultOpen)

  async function assignVendorAction(
    _prev: FormState,
    formData: FormData,
  ): Promise<FormState> {
    const vendorId = formData.get('vendorId') as string
    const scheduledDate = formData.get('scheduledDate') as string
    const scheduledTime = formData.get('scheduledTime') as string

    if (!vendorId) return { error: 'Please select a vendor.' }

    let scheduledAt: Date | undefined
    if (scheduledDate && scheduledTime) {
      scheduledAt = new Date(`${scheduledDate}T${scheduledTime}:00`)
    } else if (scheduledDate) {
      scheduledAt = new Date(scheduledDate)
    }

    const result = await assignVendor(requestId, vendorId, scheduledAt)
    if (!result.success) return { error: result.error }
    return { error: null, success: true }
  }

  const [state, formAction] = useActionState(assignVendorAction, { error: null })

  useEffect(() => {
    if (state.success) {
      setOpen(false)
      router.refresh()
    }
  }, [state.success, router])

  // Group vendors by trade
  const tradeGroups = vendors.reduce<Record<string, Vendor[]>>((acc, v) => {
    const key = v.trade.charAt(0).toUpperCase() + v.trade.slice(1)
    if (!acc[key]) acc[key] = []
    acc[key].push(v)
    return acc
  }, {})

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant={variant}>
            <UserCheck className="size-4" />
            {label}
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Vendor</DialogTitle>
        </DialogHeader>

        <form action={formAction} className="space-y-4 mt-1">
          {state.error && (
            <div className="flex items-start gap-2.5 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2.5">
              <AlertCircle className="size-4 text-destructive mt-0.5 shrink-0" />
              <p className="text-sm text-destructive">{state.error}</p>
            </div>
          )}

          {/* Vendor select */}
          <div className="space-y-1.5">
            <Label htmlFor="vendorId">
              Vendor <span className="text-destructive">*</span>
            </Label>
            <select
              id="vendorId"
              name="vendorId"
              required
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="">Select a vendor…</option>
              {Object.entries(tradeGroups).sort().map(([trade, tradeVendors]) => (
                <optgroup key={trade} label={trade}>
                  {tradeVendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} — {v.contactName}
                      {v.rating ? ` (★ ${v.rating})` : ''}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Scheduled date + time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="scheduledDate">Scheduled Date</Label>
              <Input
                id="scheduledDate"
                name="scheduledDate"
                type="date"
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

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="assignNotes">Notes (optional)</Label>
            <Textarea
              id="assignNotes"
              name="assignNotes"
              placeholder="Any instructions or context for the vendor…"
              rows={3}
              className="w-full"
            />
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" type="button" />}>
              Cancel
            </DialogClose>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
