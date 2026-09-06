'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, ArrowLeft, User, DollarSign, Users, Building2, FileText, Clock } from 'lucide-react'
import Link from 'next/link'
import { StatusBadge } from '@/components/shared/status-badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { updateApplicationStatus, getApplicationById } from '@/lib/actions/application-actions'
import { ApplicationStatus, Application } from '@/types'
import { use, useEffect } from 'react'
import { cn } from 'cn'

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
      <span className="text-sm text-gray-900">{value ?? '—'}</span>
    </div>
  )
}

// Since we need server data, use a hybrid approach with a client component that fetches
export default function ApplicationDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ applicationId: string }>
  searchParams: Promise<{ action?: string }>
}) {
  const { applicationId } = use(params)
  const { action: initialAction } = use(searchParams)

  const router = useRouter()
  const [app, setApp] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [dialogAction, setDialogAction] = useState<'approve' | 'deny' | 'withdraw' | null>(
    initialAction === 'approve' ? 'approve' : initialAction === 'deny' ? 'deny' : initialAction === 'withdraw' ? 'withdraw' : null
  )
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getApplicationById(applicationId).then((res) => {
      if (res.success) setApp(res.data)
      setLoading(false)
    })
  }, [applicationId])

  async function handleAction() {
    if (!dialogAction || !app) return
    setSaving(true)
    const statusMap = {
      approve: ApplicationStatus.APPROVED,
      deny: ApplicationStatus.DENIED,
      withdraw: ApplicationStatus.WITHDRAWN,
    }
    await updateApplicationStatus(app.id, statusMap[dialogAction], notes || undefined)
    setSaving(false)
    setDialogAction(null)
    // Refresh data
    const res = await getApplicationById(applicationId)
    if (res.success) setApp(res.data)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 text-sm">Loading application...</div>
      </div>
    )
  }

  if (!app) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 text-sm">Application not found.</div>
      </div>
    )
  }

  const references = app.references
    ? app.references.split(';').map((r) => r.trim()).filter(Boolean)
    : []

  const statusHistory = [
    { event: 'Application submitted', date: app.submittedAt, status: 'PENDING' },
    ...(app.decidedAt
      ? [{ event: `Application ${app.status.toLowerCase()}`, date: app.decidedAt, status: app.status }]
      : []),
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Link href="/manager/applications" className="mt-1 text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{app.applicantName}</h1>
              <StatusBadge status={app.status} />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Application for <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">{app.unitId}</span>
              {' · '} Submitted {app.submittedAt.toLocaleDateString()}
            </p>
          </div>
        </div>
        {app.status === ApplicationStatus.PENDING && (
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              className="gap-1.5 text-red-700 border-red-200 hover:bg-red-50"
              onClick={() => setDialogAction('deny')}
            >
              <XCircle size={15} />
              Deny
            </Button>
            <Button
              className="gap-1.5 bg-green-600 hover:bg-green-700"
              onClick={() => setDialogAction('approve')}
            >
              <CheckCircle size={15} />
              Approve
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User size={16} className="text-blue-600" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-5">
              <InfoRow label="Full Name" value={app.applicantName} />
              <InfoRow label="Email" value={app.applicantEmail} />
              <InfoRow label="Phone" value={app.applicantPhone} />
              <InfoRow label="Status" value={app.status} />
            </CardContent>
          </Card>

          {/* Financial Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <DollarSign size={16} className="text-green-600" />
                Financial Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-5">
              <InfoRow
                label="Annual Income"
                value={app.income ? `$${app.income.toLocaleString()}` : 'Not provided'}
              />
              <InfoRow label="Employer" value={app.employerName} />
              <InfoRow label="Credit Score" value={app.creditScore} />
            </CardContent>
          </Card>

          {/* References */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users size={16} className="text-purple-600" />
                References
              </CardTitle>
            </CardHeader>
            <CardContent>
              {references.length === 0 ? (
                <p className="text-sm text-gray-400">No references provided.</p>
              ) : (
                <ul className="space-y-3">
                  {references.map((ref, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 rounded-lg bg-gray-50 px-4 py-3"
                    >
                      <div className="flex size-6 items-center justify-center rounded-full bg-purple-100 text-purple-700 text-xs font-bold shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <span className="text-sm text-gray-700">{ref}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText size={16} className="text-orange-500" />
                Internal Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {app.notes ? (
                <p className="text-sm text-gray-700 leading-relaxed">{app.notes}</p>
              ) : (
                <p className="text-sm text-gray-400">No notes.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Unit Applied For */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 size={16} className="text-indigo-600" />
                Unit Applied For
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg bg-gray-50 px-4 py-3">
                <p className="text-xs text-gray-500 mb-1">Unit ID</p>
                <p className="font-mono text-sm font-semibold text-gray-900">{app.unitId}</p>
              </div>
            </CardContent>
          </Card>

          {/* Status History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock size={16} className="text-gray-500" />
                Status History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="relative border-l border-gray-200 space-y-4 ml-2">
                {statusHistory.map((item, i) => (
                  <li key={i} className="pl-5">
                    <div className="absolute -left-1.5 mt-1 h-3 w-3 rounded-full bg-white ring-2 ring-gray-300" />
                    <StatusBadge status={item.status} />
                    <p className="mt-1 text-xs text-gray-500">
                      {item.event}
                    </p>
                    <p className="text-xs text-gray-400">
                      {item.date.toLocaleDateString()} {item.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Dialog */}
      <Dialog open={dialogAction !== null} onOpenChange={() => setDialogAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className={cn(
              dialogAction === 'approve' && 'text-green-700',
              dialogAction === 'deny' && 'text-red-700',
              dialogAction === 'withdraw' && 'text-gray-700',
            )}>
              {dialogAction === 'approve' && 'Approve Application'}
              {dialogAction === 'deny' && 'Deny Application'}
              {dialogAction === 'withdraw' && 'Mark as Withdrawn'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-gray-600">
              {dialogAction === 'approve' && `You are approving the application for ${app.applicantName}. A lease offer will need to be prepared separately.`}
              {dialogAction === 'deny' && `You are denying the application for ${app.applicantName}. A denial notice can be sent to the applicant.`}
              {dialogAction === 'withdraw' && `Mark this application as withdrawn per applicant's request.`}
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (optional)
              </label>
              <Textarea
                placeholder="Add decision notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogAction(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              disabled={saving}
              className={cn(
                dialogAction === 'approve' && 'bg-green-600 hover:bg-green-700',
                dialogAction === 'deny' && 'bg-red-600 hover:bg-red-700',
              )}
            >
              {saving ? 'Saving...' : dialogAction === 'approve' ? 'Approve' : dialogAction === 'deny' ? 'Deny' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
