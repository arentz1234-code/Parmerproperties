'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createLead } from '@/lib/actions/lead-actions'
import { LeadSource } from '@/types'

const PROPERTIES = [
  { id: 'prop_rv1', label: 'Richland Village (538 Richland Rd)' },
  { id: 'prop_bab', label: 'Bragg Ave Brownstones (152 Bragg Ave)' },
  { id: 'prop_jac', label: 'Judd Ave Cottages (533 Judd Ave)' },
  { id: 'prop_rv3', label: 'Richland Village III (1256 Shug Jordan Pkwy)' },
]

const SOURCES: { value: LeadSource; label: string }[] = [
  { value: LeadSource.ZILLOW, label: 'Zillow' },
  { value: LeadSource.WEBSITE, label: 'Website' },
  { value: LeadSource.REFERRAL, label: 'Referral' },
  { value: LeadSource.APARTMENTS_COM, label: 'Apartments.com' },
  { value: LeadSource.WALK_IN, label: 'Walk-in' },
  { value: LeadSource.OTHER, label: 'Other' },
]

export default function NewLeadPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    propertyId: '',
    source: '' as LeadSource | '',
    notes: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.email || !form.source) {
      setError('Name, email, and source are required.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const result = await createLead({
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        propertyId: form.propertyId || undefined,
        source: form.source as LeadSource,
        notes: form.notes || undefined,
        status: 'NEW',
      })
      if (result.success) {
        router.push('/manager/leads')
      } else {
        setError('Failed to create lead. Please try again.')
      }
    } catch {
      setError('Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/manager/leads" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add New Lead</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lead Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                className="mt-1"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Jane Smith"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Email */}
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  className="mt-1"
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="jane@example.com"
                  required
                />
              </div>
              {/* Phone */}
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  className="mt-1"
                  value={form.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="(334) 555-0000"
                />
              </div>
            </div>

            {/* Property Interest */}
            <div>
              <Label htmlFor="property">Property Interest</Label>
              <Select value={form.propertyId} onValueChange={(v) => updateField('propertyId', v ?? '')}>
                <SelectTrigger id="property" className="mt-1">
                  <SelectValue placeholder="Select a property (optional)..." />
                </SelectTrigger>
                <SelectContent>
                  {PROPERTIES.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Source */}
            <div>
              <Label htmlFor="source">Source *</Label>
              <Select value={form.source || null} onValueChange={(v) => updateField('source', v ?? '')}>
                <SelectTrigger id="source" className="mt-1">
                  <SelectValue placeholder="How did they find us?" />
                </SelectTrigger>
                <SelectContent>
                  {SOURCES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                className="mt-1"
                value={form.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                placeholder="Add any relevant context about this lead..."
                rows={4}
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</p>
            )}

            <div className="flex items-center gap-3 pt-2">
              <Link href="/manager/leads">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 size={14} className="animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  'Add Lead'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
