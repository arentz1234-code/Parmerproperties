'use client'

import { useState } from 'react'
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Upload,
  XCircle,
  RefreshCw,
} from 'lucide-react'
import { cn } from 'cn'
import { formatDate } from '@/lib/utils'

// Mock insurance policy on file for demo
const MOCK_POLICY = {
  provider: 'State Farm',
  policyNumber: 'SF-8821-44921-TN',
  coverageAmount: 50000,
  expiryDate: new Date('2027-03-15'),
  uploadedAt: new Date('2026-08-01'),
}

function getInsuranceStatus(expiryDate: Date): { label: string; color: string; bg: string } {
  const now = new Date()
  const daysUntil = Math.ceil(
    (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  )

  if (daysUntil < 0) {
    return { label: 'Expired', color: 'text-red-700', bg: 'bg-red-100' }
  }
  if (daysUntil <= 30) {
    return { label: 'Expiring Soon', color: 'text-amber-700', bg: 'bg-amber-100' }
  }
  return { label: 'Active', color: 'text-green-700', bg: 'bg-green-100' }
}

interface UploadFormProps {
  onSuccess: () => void
  onCancel?: () => void
  isUpdate?: boolean
}

function InsuranceUploadForm({ onSuccess, onCancel, isUpdate }: UploadFormProps) {
  const [form, setForm] = useState({
    provider: '',
    policyNumber: '',
    coverageAmount: '',
    expiryDate: '',
    file: null as File | null,
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, file: e.target.files?.[0] ?? null }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!form.provider || !form.policyNumber || !form.coverageAmount || !form.expiryDate) {
      setError('Please fill in all required fields.')
      return
    }
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 900))
    setSubmitting(false)
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Insurance Provider <span className="text-red-500">*</span>
          </label>
          <input
            name="provider"
            value={form.provider}
            onChange={handleChange}
            placeholder="e.g. State Farm, Lemonade"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d9d5c]/40 focus:border-[#2d9d5c] transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Policy Number <span className="text-red-500">*</span>
          </label>
          <input
            name="policyNumber"
            value={form.policyNumber}
            onChange={handleChange}
            placeholder="e.g. SF-12345-ABC"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d9d5c]/40 focus:border-[#2d9d5c] transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Coverage Amount ($) <span className="text-red-500">*</span>
          </label>
          <input
            name="coverageAmount"
            type="number"
            min="0"
            value={form.coverageAmount}
            onChange={handleChange}
            placeholder="e.g. 50000"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d9d5c]/40 focus:border-[#2d9d5c] transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Policy Expiry Date <span className="text-red-500">*</span>
          </label>
          <input
            name="expiryDate"
            type="date"
            value={form.expiryDate}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d9d5c]/40 focus:border-[#2d9d5c] transition-colors"
          />
        </div>
      </div>

      {/* File upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Upload Policy Document (optional)
        </label>
        <label className="flex items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-4 py-6 cursor-pointer hover:border-[#2d9d5c]/50 hover:bg-[#2d9d5c]/5 transition-colors">
          <Upload size={20} className="text-gray-400" />
          <div className="text-center">
            {form.file ? (
              <span className="text-sm font-medium text-[#2d9d5c]">{form.file.name}</span>
            ) : (
              <>
                <span className="text-sm text-gray-500">Click to upload</span>
                <p className="text-xs text-gray-400 mt-0.5">PDF, JPG, or PNG up to 10MB</p>
              </>
            )}
          </div>
          <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFile} />
        </label>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
          <XCircle size={15} className="text-red-500 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className={cn(
            'flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition-colors',
            submitting
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-[#2d9d5c] hover:bg-[#2d9d5c]/80',
          )}
        >
          {submitting
            ? 'Submitting…'
            : isUpdate
            ? 'Update Insurance'
            : 'Submit Insurance'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}

export default function TenantInsurancePage() {
  // For demo: we show an existing policy on file
  const [hasPolicy, setHasPolicy] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const policy = MOCK_POLICY
  const status = getInsuranceStatus(policy.expiryDate)

  function handleSuccess() {
    setHasPolicy(true)
    setIsUpdating(false)
    setSuccessMsg('Insurance information updated successfully.')
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Renter's Insurance</h1>
        <p className="text-gray-500 mt-0.5 text-sm">
          Renter's insurance is required for all Parmer Properties residents.
        </p>
      </div>

      {/* Success */}
      {successMsg && (
        <div className="flex items-center gap-3 rounded-xl bg-green-50 border border-green-200 px-4 py-3">
          <CheckCircle2 size={16} className="text-green-500 shrink-0" />
          <p className="text-sm text-green-700 font-medium">{successMsg}</p>
        </div>
      )}

      {/* No insurance banner */}
      {!hasPolicy && (
        <div className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 px-4 py-4">
          <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-800">Insurance Required</p>
            <p className="text-sm text-red-700 mt-0.5">
              You don't have a renter's insurance policy on file. Please submit your policy details below to remain in compliance with your lease.
            </p>
          </div>
        </div>
      )}

      {/* Policy on file */}
      {hasPolicy && !isUpdating && (
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-xl bg-[#2d9d5c]/10 flex items-center justify-center">
                <Shield size={22} className="text-[#2d9d5c]" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-lg">{policy.provider}</p>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${status.bg} ${status.color}`}>
                  {status.label}
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsUpdating(true)}
              className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <RefreshCw size={14} />
              Update Insurance
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs text-gray-500 mb-1">Policy Number</p>
              <p className="text-sm font-semibold text-gray-900 break-all">{policy.policyNumber}</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs text-gray-500 mb-1">Coverage</p>
              <p className="text-sm font-semibold text-gray-900">
                ${policy.coverageAmount.toLocaleString()}
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs text-gray-500 mb-1">Expiry Date</p>
              <p className="text-sm font-semibold text-gray-900">{formatDate(policy.expiryDate)}</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs text-gray-500 mb-1">Submitted</p>
              <p className="text-sm font-semibold text-gray-900">{formatDate(policy.uploadedAt)}</p>
            </div>
          </div>

          {status.label === 'Expiring Soon' && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
              <Clock size={15} className="text-amber-500 shrink-0" />
              <p className="text-sm text-amber-700">
                Your policy is expiring soon. Please renew and update your policy information to avoid a coverage gap.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Update form */}
      {hasPolicy && isUpdating && (
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Update Insurance Policy</h2>
          <InsuranceUploadForm
            onSuccess={handleSuccess}
            onCancel={() => setIsUpdating(false)}
            isUpdate
          />
        </div>
      )}

      {/* Upload form when no policy */}
      {!hasPolicy && (
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Submit Your Insurance Policy</h2>
          <InsuranceUploadForm
            onSuccess={() => {
              setHasPolicy(true)
              setSuccessMsg("Insurance submitted successfully. You're all set!")
              setTimeout(() => setSuccessMsg(''), 4000)
            }}
          />
        </div>
      )}

      {/* Info card */}
      <div className="rounded-2xl bg-blue-50 border border-blue-100 p-5">
        <p className="text-sm font-semibold text-blue-800 mb-1">Why is renter's insurance required?</p>
        <p className="text-sm text-blue-700">
          Renter's insurance protects your personal belongings and provides liability coverage. It's affordable (typically $10–$20/month) and required per your lease agreement. We recommend a minimum of $30,000 in personal property coverage.
        </p>
      </div>
    </div>
  )
}
