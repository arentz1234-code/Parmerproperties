'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import {
  User,
  Phone,
  Mail,
  Calendar,
  Plus,
  Trash2,
  Bell,
  Lock,
  CheckCircle2,
  XCircle,
  ShieldCheck,
} from 'lucide-react'
import { cn } from 'cn'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import type { EmergencyContact } from '@/types'

// ─── Profile Tab ──────────────────────────────────────────────────────────────

function ProfileTab() {
  const { data: session } = useSession()
  const nameParts = (session?.user?.name ?? 'Sarah Mitchell').split(' ')
  const [form, setForm] = useState({
    firstName: nameParts[0] ?? 'Sarah',
    lastName: nameParts.slice(1).join(' ') ?? 'Mitchell',
    email: session?.user?.email ?? 'tenant1@demo.com',
    phone: '(334) 555-0201',
    dateOfBirth: '2001-04-12',
  })
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await new Promise((r) => setTimeout(r, 700))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3500)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {saved && (
        <div className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 px-4 py-3">
          <CheckCircle2 size={15} className="text-green-500 shrink-0" />
          <p className="text-sm text-green-700 font-medium">Profile saved successfully.</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
            <User size={13} className="text-gray-400" /> First Name
          </label>
          <input
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d9d5c]/40 focus:border-[#2d9d5c] transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
            <User size={13} className="text-gray-400" /> Last Name
          </label>
          <input
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d9d5c]/40 focus:border-[#2d9d5c] transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
            <Mail size={13} className="text-gray-400" /> Email Address
          </label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d9d5c]/40 focus:border-[#2d9d5c] transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
            <Phone size={13} className="text-gray-400" /> Phone Number
          </label>
          <input
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d9d5c]/40 focus:border-[#2d9d5c] transition-colors"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
            <Calendar size={13} className="text-gray-400" /> Date of Birth
          </label>
          <input
            name="dateOfBirth"
            type="date"
            value={form.dateOfBirth}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d9d5c]/40 focus:border-[#2d9d5c] transition-colors"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className={cn(
          'rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-colors',
          saving ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#2d9d5c] hover:bg-[#2d9d5c]/80',
        )}
      >
        {saving ? 'Saving…' : 'Save Changes'}
      </button>
    </form>
  )
}

// ─── Emergency Contacts Tab ───────────────────────────────────────────────────

function EmergencyContactsTab() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([
    { name: 'Karen Mitchell', phone: '(205) 555-0801', relationship: 'Mother' },
  ])
  const [showForm, setShowForm] = useState(false)
  const [newContact, setNewContact] = useState<EmergencyContact>({
    name: '',
    phone: '',
    relationship: '',
  })
  const [saved, setSaved] = useState(false)

  function handleAdd() {
    if (!newContact.name || !newContact.phone) return
    setContacts((prev) => [...prev, newContact])
    setNewContact({ name: '', phone: '', relationship: '' })
    setShowForm(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  function handleDelete(idx: number) {
    setContacts((prev) => prev.filter((_, i) => i !== idx))
  }

  return (
    <div className="space-y-4">
      {saved && (
        <div className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 px-4 py-3">
          <CheckCircle2 size={15} className="text-green-500 shrink-0" />
          <p className="text-sm text-green-700 font-medium">Emergency contact added.</p>
        </div>
      )}

      <div className="space-y-3">
        {contacts.map((contact, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 border border-gray-100 px-4 py-3.5"
          >
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-full bg-[#2d9d5c]/10 flex items-center justify-center shrink-0">
                <User size={15} className="text-[#2d9d5c]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{contact.name}</p>
                <p className="text-xs text-gray-500">
                  {contact.phone} · {contact.relationship}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleDelete(idx)}
              className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
              aria-label="Delete contact"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>

      {contacts.length === 0 && (
        <div className="rounded-xl bg-gray-50 border border-dashed border-gray-200 px-4 py-6 text-center">
          <p className="text-sm text-gray-400">No emergency contacts on file.</p>
        </div>
      )}

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 text-sm font-medium text-[#2d9d5c] hover:underline"
        >
          <Plus size={15} />
          Add Emergency Contact
        </button>
      ) : (
        <div className="rounded-2xl border border-gray-200 p-5 space-y-4">
          <p className="text-sm font-semibold text-gray-800">New Emergency Contact</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              placeholder="Full Name"
              value={newContact.name}
              onChange={(e) => setNewContact((p) => ({ ...p, name: e.target.value }))}
              className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d9d5c]/40 focus:border-[#2d9d5c] transition-colors"
            />
            <input
              placeholder="Phone Number"
              value={newContact.phone}
              onChange={(e) => setNewContact((p) => ({ ...p, phone: e.target.value }))}
              className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d9d5c]/40 focus:border-[#2d9d5c] transition-colors"
            />
            <input
              placeholder="Relationship"
              value={newContact.relationship}
              onChange={(e) => setNewContact((p) => ({ ...p, relationship: e.target.value }))}
              className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d9d5c]/40 focus:border-[#2d9d5c] transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="rounded-xl bg-[#2d9d5c] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2d9d5c]/80 transition-colors"
            >
              Save Contact
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Notifications Tab ────────────────────────────────────────────────────────

interface NotifPref {
  key: string
  label: string
  description: string
  enabled: boolean
}

function NotificationsTab() {
  const [prefs, setPrefs] = useState<NotifPref[]>([
    {
      key: 'rent_reminder',
      label: 'Rent Due Reminder',
      description: 'Get notified 7 days before rent is due.',
      enabled: true,
    },
    {
      key: 'payment_receipt',
      label: 'Payment Receipt',
      description: 'Receive a confirmation when your payment is processed.',
      enabled: true,
    },
    {
      key: 'maintenance_updates',
      label: 'Maintenance Updates',
      description: 'Notifications when your maintenance requests are updated.',
      enabled: true,
    },
    {
      key: 'messages',
      label: 'Messages',
      description: 'Get notified when you receive a new message.',
      enabled: true,
    },
    {
      key: 'lease_expiry',
      label: 'Lease Expiry Warning',
      description: 'Reminder 90 days before your lease expires.',
      enabled: false,
    },
  ])
  const [saved, setSaved] = useState(false)

  function toggle(key: string) {
    setPrefs((prev) =>
      prev.map((p) => (p.key === key ? { ...p, enabled: !p.enabled } : p)),
    )
  }

  async function handleSave() {
    await new Promise((r) => setTimeout(r, 500))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-5">
      {saved && (
        <div className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 px-4 py-3">
          <CheckCircle2 size={15} className="text-green-500 shrink-0" />
          <p className="text-sm text-green-700 font-medium">Notification preferences saved.</p>
        </div>
      )}

      <div className="space-y-3">
        {prefs.map((pref) => (
          <div
            key={pref.key}
            className="flex items-center justify-between gap-4 rounded-xl bg-gray-50 border border-gray-100 px-4 py-4"
          >
            <div className="flex items-start gap-3">
              <div className="size-9 rounded-xl bg-[#2d9d5c]/10 flex items-center justify-center shrink-0 mt-0.5">
                <Bell size={15} className="text-[#2d9d5c]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{pref.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{pref.description}</p>
              </div>
            </div>
            <Switch
              checked={pref.enabled}
              onCheckedChange={() => toggle(pref.key)}
              aria-label={pref.label}
            />
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        className="rounded-xl bg-[#2d9d5c] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#2d9d5c]/80 transition-colors"
      >
        Save Preferences
      </button>
    </div>
  )
}

// ─── Security Tab ─────────────────────────────────────────────────────────────

function SecurityTab() {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setResult(null)

    if (!form.currentPassword) {
      setResult({ success: false, message: 'Please enter your current password.' })
      return
    }
    if (form.newPassword.length < 8) {
      setResult({ success: false, message: 'New password must be at least 8 characters.' })
      return
    }
    if (form.newPassword !== form.confirmPassword) {
      setResult({ success: false, message: 'New passwords do not match.' })
      return
    }

    setSaving(true)
    await new Promise((r) => setTimeout(r, 800))
    setSaving(false)
    setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    setResult({ success: true, message: 'Password updated successfully.' })
    setTimeout(() => setResult(null), 4000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
      <div className="flex items-start gap-3 rounded-xl bg-blue-50 border border-blue-100 px-4 py-4 mb-2">
        <ShieldCheck size={18} className="text-blue-500 shrink-0 mt-0.5" />
        <p className="text-sm text-blue-700">
          Use a strong, unique password. We recommend at least 12 characters including uppercase, numbers, and symbols.
        </p>
      </div>

      {result && (
        <div
          className={cn(
            'flex items-center gap-2 rounded-xl border px-4 py-3',
            result.success
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200',
          )}
        >
          {result.success ? (
            <CheckCircle2 size={15} className="text-green-500 shrink-0" />
          ) : (
            <XCircle size={15} className="text-red-500 shrink-0" />
          )}
          <p className={cn('text-sm font-medium', result.success ? 'text-green-700' : 'text-red-700')}>
            {result.message}
          </p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
            <Lock size={13} className="text-gray-400" /> Current Password
          </label>
          <input
            name="currentPassword"
            type="password"
            value={form.currentPassword}
            onChange={handleChange}
            autoComplete="current-password"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d9d5c]/40 focus:border-[#2d9d5c] transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
            <Lock size={13} className="text-gray-400" /> New Password
          </label>
          <input
            name="newPassword"
            type="password"
            value={form.newPassword}
            onChange={handleChange}
            autoComplete="new-password"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d9d5c]/40 focus:border-[#2d9d5c] transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
            <Lock size={13} className="text-gray-400" /> Confirm New Password
          </label>
          <input
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            autoComplete="new-password"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d9d5c]/40 focus:border-[#2d9d5c] transition-colors"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className={cn(
          'rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-colors',
          saving ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#2d9d5c] hover:bg-[#2d9d5c]/80',
        )}
      >
        {saving ? 'Updating…' : 'Update Password'}
      </button>
    </form>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TenantAccountPage() {
  const { data: session } = useSession()
  const name = session?.user?.name ?? 'Tenant'
  const email = session?.user?.email ?? ''

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="size-16 rounded-2xl bg-[#1b3a5c] flex items-center justify-center shrink-0">
          <span className="text-2xl font-bold text-white">
            {name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
          <p className="text-gray-500 text-sm">{email}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <Tabs defaultValue="profile">
          <TabsList className="mb-6">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="emergency">Emergency Contacts</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <ProfileTab />
          </TabsContent>
          <TabsContent value="emergency">
            <EmergencyContactsTab />
          </TabsContent>
          <TabsContent value="notifications">
            <NotificationsTab />
          </TabsContent>
          <TabsContent value="security">
            <SecurityTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
