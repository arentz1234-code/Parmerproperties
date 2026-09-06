'use client'

import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  onConfirm: () => void
  variant?: 'destructive' | 'default'
  loading?: boolean
  confirmLabel?: string
  cancelLabel?: string
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  variant = 'default',
  loading = false,
  confirmLabel,
  cancelLabel = 'Cancel',
}: ConfirmDialogProps) {
  const isDestructive = variant === 'destructive'
  const defaultConfirmLabel = isDestructive ? 'Delete' : 'Confirm'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="max-w-md">
        <DialogHeader>
          <div className="flex items-start gap-3">
            {isDestructive && (
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle size={18} className="text-red-600" />
              </div>
            )}
            <div className="flex flex-col gap-1 pt-0.5">
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={isDestructive ? 'destructive' : 'default'}
            onClick={onConfirm}
            disabled={loading}
            className={
              isDestructive
                ? 'bg-red-600 hover:bg-red-700 text-white border-transparent'
                : 'bg-[#2D3561] hover:bg-[#3a4275] text-white'
            }
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="size-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                {isDestructive ? 'Deleting...' : 'Confirming...'}
              </span>
            ) : (
              confirmLabel ?? defaultConfirmLabel
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
