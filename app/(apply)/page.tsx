'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronRight, ChevronLeft, Check, Plus, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from 'cn'
import { createApplication } from '@/lib/actions/application-actions'

// Available vacant units (hardcoded from mock data)
const VACANT_UNITS = [
  { id: 'unit_rv1_103', label: 'Richland Village — Unit 103 (2BD/2.5BA, $1,575/mo)' },
  { id: 'unit_rv1_203', label: 'Richland Village — Unit 203 (4BD/3.5BA, $2,650/mo)' },
  { id: 'unit_rv1_204', label: 'Richland Village — Unit 204 (4BD/3.5BA, $2,650/mo)' },
  { id: 'unit_rv1_302', label: 'Richland Village — Unit 302 (4BD/4.5BA, $2,950/mo)' },
  { id: 'unit_rv1_303', label: 'Richland Village — Unit 303 (4BD/4.5BA, $2,950/mo)' },
  { id: 'unit_rv1_spa', label: 'Richland Village — Space A (Commercial, $2,200/mo)' },
  { id: 'unit_bab_b05', label: 'Bragg Ave Brownstones — B-05 (5BD/5.5BA, $3,900/mo)' },
  { id: 'unit_bab_b06', label: 'Bragg Ave Brownstones — B-06 (5BD/5.5BA, $3,900/mo)' },
  { id: 'unit_bab_b07', label: 'Bragg Ave Brownstones — B-07 (5BD/5.5BA, $3,900/mo)' },
  { id: 'unit_bab_b08', label: 'Bragg Ave Brownstones — B-08 (5BD/5.5BA, $3,900/mo)' },
  { id: 'unit_jac_a04', label: 'Judd Ave Cottages — J-A04 (3BD/2BA, $2,250/mo)' },
  { id: 'unit_jac_a05', label: 'Judd Ave Cottages — J-A05 (3BD/2BA, $2,200/mo)' },
  { id: 'unit_jac_b03', label: 'Judd Ave Cottages — J-B03 (2BD/2BA, $1,475/mo)' },
  { id: 'unit_jac_b04', label: 'Judd Ave Cottages — J-B04 (2BD/2BA, $1,475/mo)' },
  { id: 'unit_jac_b05', label: 'Judd Ave Cottages — J-B05 (2BD/2BA, $1,450/mo)' },
  { id: 'unit_jac_c02', label: 'Judd Ave Cottages — J-C02 (3BD/2BA, $1,950/mo)' },
  { id: 'unit_jac_c03', label: 'Judd Ave Cottages — J-C03 (3BD/2BA, $1,975/mo)' },
  { id: 'unit_jac_c04', label: 'Judd Ave Cottages — J-C04 (3BD/2BA, $1,975/mo)' },
  { id: 'unit_jac_c05', label: 'Judd Ave Cottages — J-C05 (3BD/2BA, $1,950/mo)' },
  { id: 'unit_rv3_2b', label: 'Richland Village III — R3-2B (2BD/2.5BA, $1,600/mo)' },
  { id: 'unit_rv3_3b', label: 'Richland Village III — R3-3B (3BD/3.5BA, $2,100/mo)' },
  { id: 'unit_rv3_3c', label: 'Richland Village III — R3-3C (3BD/3.5BA, $2,100/mo)' },
  { id: 'unit_rv3_4a', label: 'Richland Village III — R3-4A (4BD/3.5BA, $2,700/mo)' },
  { id: 'unit_rv3_4b', label: 'Richland Village III — R3-4B (4BD/3.5BA, $2,700/mo)' },
  { id: 'unit_rv3_4ma', label: 'Richland Village III — R3-4MA (4BD/3.5BA, $2,750/mo)' },
  { id: 'unit_rv3_4mb', label: 'Richland Village III — R3-4MB (4BD/3.5BA, $2,750/mo)' },
  { id: 'unit_rv3_ca', label: 'Richland Village III — R3-CA (3BD/3.5BA Cottage, $2,400/mo)' },
  { id: 'unit_rv3_cb', label: 'Richland Village III — R3-CB (3BD/3.5BA Cottage, $2,400/mo)' },
  { id: 'unit_rv3_cc', label: 'Richland Village III — R3-CC (3BD/3.5BA Cottage, $2,400/mo)' },
]

interface Reference {
  name: string
  phone: string
  relationship: string
}

interface FormData {
  unitId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  dob: string
  employer: string
  income: string
  employmentType: string
  references: Reference[]
}

const STEPS = ['Property & Unit', 'Personal Info', 'Employment & Income', 'References', 'Review & Submit']

const EMPTY_REF: Reference = { name: '', phone: '', relationship: '' }

export default function ApplyPage() {
  const [step, setStep] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState<FormData>({
    unitId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '',
    employer: '',
    income: '',
    employmentType: '',
    references: [{ ...EMPTY_REF }],
  })

  function updateField(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function updateRef(i: number, field: keyof Reference, value: string) {
    setForm((prev) => {
      const refs = [...prev.references]
      refs[i] = { ...refs[i], [field]: value }
      return { ...prev, references: refs }
    })
  }

  function addRef() {
    if (form.references.length >= 3) return
    setForm((prev) => ({ ...prev, references: [...prev.references, { ...EMPTY_REF }] }))
  }

  function removeRef(i: number) {
    setForm((prev) => ({ ...prev, references: prev.references.filter((_, idx) => idx !== i) }))
  }

  function canNext(): boolean {
    if (step === 0) return !!form.unitId
    if (step === 1) return !!(form.firstName && form.lastName && form.email && form.phone)
    if (step === 2) return !!(form.income && form.employmentType)
    return true
  }

  async function handleSubmit() {
    setSubmitting(true)
    setError('')
    try {
      const refsString = form.references
        .filter((r) => r.name)
        .map((r) => `${r.name}, ${r.relationship}, ${r.phone}`)
        .join('; ')

      const result = await createApplication({
        unitId: form.unitId,
        applicantName: `${form.firstName} ${form.lastName}`,
        applicantEmail: form.email,
        applicantPhone: form.phone,
        income: form.income ? parseFloat(form.income) : undefined,
        employerName: form.employer || undefined,
        references: refsString || undefined,
      })
      if (result.success) {
        setSubmitted(true)
      } else {
        setError('Something went wrong. Please try again.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const selectedUnit = VACANT_UNITS.find((u) => u.id === form.unitId)

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-white">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-green-100">
            <Check size={32} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Application Submitted!</h1>
          <p className="text-gray-600">
            Thank you for applying to live at Parmer Properties. We have received your application for{' '}
            <strong>{selectedUnit?.label.split(' — ')[0]}</strong> and will be in touch within 2–3 business days.
          </p>
          <p className="text-sm text-gray-400">
            A confirmation has been sent to <strong>{form.email}</strong>.
          </p>
          <a
            href="https://parmerdevelopment.com"
            className="inline-block rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Visit Our Website
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="mx-auto max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex flex-col items-center gap-2">
            <Image src="/logo.png" alt="Parmer Properties" width={48} height={48} className="rounded-lg" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">Parmer Properties</p>
              <h1 className="text-xl font-bold text-gray-900">Rental Application</h1>
            </div>
          </div>
        </div>

        {/* Step indicators */}
        <div className="mb-8 flex items-center justify-between">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <div
                className={cn(
                  'flex size-8 items-center justify-center rounded-full text-xs font-bold transition-colors',
                  i < step && 'bg-blue-600 text-white',
                  i === step && 'bg-blue-600 text-white ring-4 ring-blue-100',
                  i > step && 'bg-gray-200 text-gray-500',
                )}
              >
                {i < step ? <Check size={14} /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    'h-0.5 flex-1 mx-1 transition-colors',
                    i < step ? 'bg-blue-600' : 'bg-gray-200',
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">{STEPS[step]}</h2>

          {/* Step 0: Property & Unit */}
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="unit">Select a Unit</Label>
                <Select value={form.unitId} onValueChange={(v) => updateField('unitId', v ?? '')}>
                  <SelectTrigger id="unit" className="mt-1">
                    <SelectValue placeholder="Choose an available unit..." />
                  </SelectTrigger>
                  <SelectContent>
                    {VACANT_UNITS.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {form.unitId && (
                <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                  <p className="text-sm font-medium text-blue-800">Selected Unit</p>
                  <p className="text-sm text-blue-700 mt-1">{selectedUnit?.label}</p>
                  <p className="text-xs text-blue-500 mt-1">Fall 2027 Pre-Leasing</p>
                </div>
              )}
            </div>
          )}

          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  className="mt-1"
                  value={form.firstName}
                  onChange={(e) => updateField('firstName', e.target.value)}
                  placeholder="Jane"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  className="mt-1"
                  value={form.lastName}
                  onChange={(e) => updateField('lastName', e.target.value)}
                  placeholder="Smith"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  className="mt-1"
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="jane@example.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  className="mt-1"
                  value={form.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="(334) 555-0000"
                />
              </div>
              <div>
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  className="mt-1"
                  value={form.dob}
                  onChange={(e) => updateField('dob', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Step 2: Employment & Income */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="employmentType">Employment Type</Label>
                <Select value={form.employmentType} onValueChange={(v) => updateField('employmentType', v ?? '')}>
                  <SelectTrigger id="employmentType" className="mt-1">
                    <SelectValue placeholder="Select employment type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full_time">Full-time Employee</SelectItem>
                    <SelectItem value="part_time">Part-time Employee</SelectItem>
                    <SelectItem value="self_employed">Self-employed</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="graduate_student">Graduate Student / TA</SelectItem>
                    <SelectItem value="retired">Retired</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="employer">Employer / University</Label>
                <Input
                  id="employer"
                  className="mt-1"
                  value={form.employer}
                  onChange={(e) => updateField('employer', e.target.value)}
                  placeholder="Auburn University"
                />
              </div>
              <div>
                <Label htmlFor="income">Annual Income ($)</Label>
                <Input
                  id="income"
                  type="number"
                  className="mt-1"
                  value={form.income}
                  onChange={(e) => updateField('income', e.target.value)}
                  placeholder="e.g. 18000"
                  min="0"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Include parental guarantor income if applicable. Students may enter 0.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: References */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">Add up to 3 references (e.g., employer, prior landlord, professor).</p>
              {form.references.map((ref, i) => (
                <div key={i} className="rounded-lg border border-gray-200 p-4 space-y-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-700">Reference {i + 1}</p>
                    {form.references.length > 1 && (
                      <button
                        onClick={() => removeRef(i)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <Label>Full Name</Label>
                      <Input
                        className="mt-1"
                        value={ref.name}
                        onChange={(e) => updateRef(i, 'name', e.target.value)}
                        placeholder="Dr. Jane Smith"
                      />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input
                        className="mt-1"
                        value={ref.phone}
                        onChange={(e) => updateRef(i, 'phone', e.target.value)}
                        placeholder="(334) 555-0000"
                      />
                    </div>
                    <div>
                      <Label>Relationship</Label>
                      <Input
                        className="mt-1"
                        value={ref.relationship}
                        onChange={(e) => updateRef(i, 'relationship', e.target.value)}
                        placeholder="Professor / Landlord"
                      />
                    </div>
                  </div>
                </div>
              ))}
              {form.references.length < 3 && (
                <button
                  onClick={addRef}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  <Plus size={14} />
                  Add another reference
                </button>
              )}
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="space-y-5">
              <div className="rounded-lg bg-gray-50 p-4 space-y-3">
                <h3 className="text-sm font-semibold text-gray-700">Unit</h3>
                <p className="text-sm text-gray-600">{selectedUnit?.label ?? 'Not selected'}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4 space-y-2">
                <h3 className="text-sm font-semibold text-gray-700">Personal Information</h3>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                  <span className="text-gray-400">Name</span>
                  <span>{form.firstName} {form.lastName}</span>
                  <span className="text-gray-400">Email</span>
                  <span>{form.email}</span>
                  <span className="text-gray-400">Phone</span>
                  <span>{form.phone}</span>
                  <span className="text-gray-400">Date of Birth</span>
                  <span>{form.dob || 'Not provided'}</span>
                </div>
              </div>
              <div className="rounded-lg bg-gray-50 p-4 space-y-2">
                <h3 className="text-sm font-semibold text-gray-700">Employment & Income</h3>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                  <span className="text-gray-400">Type</span>
                  <span>{form.employmentType || 'Not provided'}</span>
                  <span className="text-gray-400">Employer</span>
                  <span>{form.employer || 'Not provided'}</span>
                  <span className="text-gray-400">Annual Income</span>
                  <span>{form.income ? `$${parseFloat(form.income).toLocaleString()}` : '$0'}</span>
                </div>
              </div>
              {form.references.filter((r) => r.name).length > 0 && (
                <div className="rounded-lg bg-gray-50 p-4 space-y-2">
                  <h3 className="text-sm font-semibold text-gray-700">References</h3>
                  {form.references.filter((r) => r.name).map((ref, i) => (
                    <p key={i} className="text-sm text-gray-600">
                      {ref.name} — {ref.relationship} — {ref.phone}
                    </p>
                  ))}
                </div>
              )}
              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</p>
              )}
              <p className="text-xs text-gray-400 leading-relaxed">
                By submitting this application, you authorize Parmer Properties to run a credit and background check. All information provided is true and accurate to the best of your knowledge.
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
            className="gap-2"
          >
            <ChevronLeft size={16} />
            Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canNext()}
              className="gap-2"
            >
              Continue
              <ChevronRight size={16} />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Check size={16} />
                  Submit Application
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
