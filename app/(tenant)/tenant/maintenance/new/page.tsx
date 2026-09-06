'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Upload,
  X,
  CheckCircle2,
  AlertTriangle,
  Image as ImageIcon,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from 'cn'
import { createMaintenanceRequest } from '@/lib/actions/maintenance-actions'
import { MaintenancePriority } from '@/types'

const CATEGORIES = [
  { value: 'plumbing',    label: 'Plumbing' },
  { value: 'electrical',  label: 'Electrical' },
  { value: 'hvac',        label: 'HVAC / Air Conditioning' },
  { value: 'appliance',   label: 'Appliance' },
  { value: 'general',     label: 'General Maintenance' },
  { value: 'pest',        label: 'Pest Control' },
  { value: 'other',       label: 'Other' },
]

const PRIORITIES = [
  {
    value: MaintenancePriority.EMERGENCY,
    label: 'Emergency',
    description: 'Immediate danger or uninhabitable condition',
    color: 'border-red-300 bg-red-50 text-red-800',
    activeColor: 'border-red-500 bg-red-50',
    dot: 'bg-red-500',
  },
  {
    value: MaintenancePriority.HIGH,
    label: 'High',
    description: 'Significantly affects daily life',
    color: 'border-orange-300 bg-orange-50 text-orange-800',
    activeColor: 'border-orange-500 bg-orange-50',
    dot: 'bg-orange-500',
  },
  {
    value: MaintenancePriority.MEDIUM,
    label: 'Medium',
    description: 'Inconvenient but manageable',
    color: 'border-yellow-300 bg-yellow-50 text-yellow-800',
    activeColor: 'border-yellow-400 bg-yellow-50',
    dot: 'bg-yellow-400',
  },
  {
    value: MaintenancePriority.LOW,
    label: 'Low',
    description: 'Minor issue, no urgency',
    color: 'border-gray-200 bg-gray-50 text-gray-700',
    activeColor: 'border-gray-400 bg-gray-50',
    dot: 'bg-gray-400',
  },
]

export default function NewMaintenancePage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [priority, setPriority] = useState<MaintenancePriority>(MaintenancePriority.MEDIUM)
  const [description, setDescription] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleFiles(selected: FileList | null) {
    if (!selected) return
    const newFiles = Array.from(selected).filter((f) => f.type.startsWith('image/'))
    setFiles((prev) => [...prev, ...newFiles].slice(0, 5))
  }

  function removeFile(idx: number) {
    setFiles((prev) => prev.filter((_, i) => i !== idx))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !description.trim() || !category) return
    setIsSubmitting(true)
    setError(null)

    const result = await createMaintenanceRequest({
      unitId: 'unit_rv1_101', // In production: fetched from tenant's lease
      requestedBy: 'tenant_001', // In production: from auth session
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      status: 'OPEN' as any,
    })

    setIsSubmitting(false)
    if (result.success) {
      setSuccess(true)
    } else {
      setError(result.error)
    }
  }

  if (success) {
    return (
      <div className="max-w-xl mx-auto flex flex-col items-center justify-center py-16 gap-6 text-center">
        <div className="size-20 rounded-full bg-[#2d9d5c]/10 flex items-center justify-center">
          <CheckCircle2 size={40} className="text-[#2d9d5c]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Request Submitted!</h1>
          <p className="text-gray-500 mt-2">
            We've received your maintenance request and will get back to you shortly.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/tenant/maintenance"
            className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            View All Requests
          </Link>
          <button
            onClick={() => {
              setSuccess(false)
              setTitle('')
              setCategory('')
              setPriority(MaintenancePriority.MEDIUM)
              setDescription('')
              setFiles([])
            }}
            className="rounded-xl bg-[#2d9d5c] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#238a4e] transition-colors"
          >
            Submit Another
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back link */}
      <Link
        href="/tenant/maintenance"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-5 transition-colors"
      >
        <ArrowLeft size={15} />
        Back to Maintenance
      </Link>

      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 p-6">
        <h1 className="text-xl font-bold text-gray-900 mb-1">Submit a Maintenance Request</h1>
        <p className="text-sm text-gray-500 mb-6">
          Describe the issue and we'll get someone out as soon as possible.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Issue Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Leaking faucet in bathroom"
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2d9d5c]/40 focus:border-[#2d9d5c] transition-colors"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2d9d5c]/40 focus:border-[#2d9d5c] transition-colors bg-white"
            >
              <option value="">Select a category...</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {PRIORITIES.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriority(p.value)}
                  className={cn(
                    'flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center',
                    priority === p.value
                      ? p.activeColor + ' border-current'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <div className={cn('size-3 rounded-full', p.dot)} />
                  <p className="text-xs font-semibold text-gray-800">{p.label}</p>
                  <p className="text-[10px] text-gray-500 leading-tight">{p.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              required
              placeholder="Please describe the issue in detail. Include when it started, how severe it is, and any steps you've already tried."
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2d9d5c]/40 focus:border-[#2d9d5c] transition-colors resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">{description.length} characters</p>
          </div>

          {/* Photo upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Photos (optional)
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-[#2d9d5c] hover:bg-[#2d9d5c]/5 transition-all"
            >
              <div className="size-10 rounded-full bg-gray-100 flex items-center justify-center">
                <Upload size={18} className="text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-600">Click to upload photos</p>
              <p className="text-xs text-gray-400">PNG, JPG up to 10MB each — max 5 photos</p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="sr-only"
                onChange={(e) => handleFiles(e.target.files)}
              />
            </div>

            {/* Selected files */}
            {files.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {files.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5 text-xs text-gray-700"
                  >
                    <ImageIcon size={12} className="text-gray-400" />
                    <span className="max-w-32 truncate">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Emergency notice */}
          {priority === MaintenancePriority.EMERGENCY && (
            <div className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 p-4">
              <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-800">Emergency Request</p>
                <p className="text-xs text-red-700 mt-0.5">
                  If this is a life-threatening emergency (gas leak, fire, flooding), please call 911
                  immediately. For urgent property issues, you may also call us directly at{' '}
                  <a href="tel:3347502059" className="underline font-medium">(334) 750-2059</a>.
                </p>
              </div>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              {error}
            </p>
          )}

          {/* Submit */}
          <div className="flex gap-3 pt-1">
            <Link
              href="/tenant/maintenance"
              className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !description.trim() || !category}
              className={cn(
                'flex-1 rounded-xl py-3 text-sm font-semibold text-white transition-all',
                isSubmitting || !title.trim() || !description.trim() || !category
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-[#2d9d5c] hover:bg-[#238a4e] active:scale-[0.98]'
              )}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
