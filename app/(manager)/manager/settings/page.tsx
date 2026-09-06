'use client'

import { useState } from 'react'
import { Save, Edit2, X, Plus } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { COMPANY_INFO } from '@/lib/constants'

// ─── Email Template Modal ─────────────────────────────────────────────────────

function EmailTemplateModal({
  name,
  onClose,
}: {
  name: string
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">Edit: {name}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>
        <Textarea
          rows={10}
          defaultValue={`Subject: Regarding your tenancy at Parmer Properties\n\nDear {{tenant_name}},\n\nThis is a template email for: ${name}\n\n[Edit this template to customize the message...]\n\nBest regards,\nParmer Properties Management`}
          className="font-mono text-xs"
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onClose}>
            <Save size={14} />
            Save Template
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const EMAIL_TEMPLATES = [
  'Rent Due Reminder',
  'Payment Received Confirmation',
  'Late Payment Notice',
  'Pay-or-Quit Notice',
  'Lease Renewal Offer',
  'Maintenance Request Acknowledgment',
  'Move-Out Instructions',
  'Welcome Letter',
]

const NOTIFICATION_TOGGLES = [
  { id: 'rent_due', label: 'Rent Due Reminder', description: 'Notify 3 days before rent is due', default: true },
  { id: 'payment_received', label: 'Payment Received', description: 'Confirm when a payment is recorded', default: true },
  { id: 'maintenance_created', label: 'Maintenance Request Created', description: 'Alert when a new request is submitted', default: true },
  { id: 'lease_expiry', label: 'Lease Expiry Warning', description: 'Warn 60 days before lease expires', default: true },
  { id: 'new_application', label: 'New Application', description: 'Alert when a new rental application arrives', default: false },
]

const USERS = [
  { name: 'Andrew Rentz', email: 'arentz1234@gmail.com', role: 'Manager', status: 'Active' },
]

export default function SettingsPage() {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null)
  const [notifications, setNotifications] = useState<Record<string, boolean>>(
    Object.fromEntries(NOTIFICATION_TOGGLES.map((t) => [t.id, t.default])),
  )

  function handleSave() {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }, 800)
  }

  return (
    <div>
      <PageHeader title="Settings" description="Configure your property management preferences" />

      {editingTemplate && (
        <EmailTemplateModal
          name={editingTemplate}
          onClose={() => setEditingTemplate(null)}
        />
      )}

      <Tabs defaultValue="company">
        <TabsList className="mb-6">
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="late-fees">Late Fees</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="templates">Email Templates</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        {/* ── Company Tab ── */}
        <TabsContent value="company">
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Logo */}
              <div>
                <Label>Company Logo</Label>
                <div className="mt-2 flex items-center gap-4">
                  <img
                    src="/logo.png"
                    alt="Parmer Properties Logo"
                    className="h-14 w-auto rounded-lg border border-gray-200 object-contain"
                  />
                  <Button variant="outline" size="sm">
                    Change Logo
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input id="companyName" className="mt-1" defaultValue={COMPANY_INFO.company} />
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Input id="address" className="mt-1" defaultValue={COMPANY_INFO.address} />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" className="mt-1" defaultValue={COMPANY_INFO.phone} />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" className="mt-1" defaultValue={COMPANY_INFO.email} />
                </div>
              </div>

              <div>
                <Label htmlFor="website">Website</Label>
                <Input id="website" className="mt-1" defaultValue={COMPANY_INFO.website} />
              </div>

              <div className="flex justify-end gap-2 border-t border-gray-200 pt-4">
                <Button onClick={handleSave} disabled={saving}>
                  <Save size={14} />
                  {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Late Fees Tab ── */}
        <TabsContent value="late-fees">
          <Card className="max-w-xl">
            <CardHeader>
              <CardTitle>Late Fee Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <Label htmlFor="gracePeriod">Grace Period (days)</Label>
                <Input
                  id="gracePeriod"
                  type="number"
                  min={0}
                  max={30}
                  defaultValue={5}
                  className="mt-1 w-32"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Late fees will be applied after this many days past the due date.
                </p>
              </div>

              <div>
                <Label>Late Fee Type</Label>
                <div className="mt-2 flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="feeType" value="flat" defaultChecked />
                    <span className="text-sm text-gray-700">Flat Amount</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="feeType" value="percent" />
                    <span className="text-sm text-gray-700">Percentage of Rent</span>
                  </label>
                </div>
              </div>

              <div>
                <Label htmlFor="feeAmount">Fee Amount</Label>
                <div className="relative mt-1 w-40">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <Input id="feeAmount" type="number" min={0} defaultValue={75} className="pl-7" />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-gray-200 pt-4">
                <Button onClick={handleSave} disabled={saving}>
                  <Save size={14} />
                  {saving ? 'Saving...' : 'Save Settings'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Notifications Tab ── */}
        <TabsContent value="notifications">
          <Card className="max-w-xl">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-gray-100">
                {NOTIFICATION_TOGGLES.map((toggle) => (
                  <div key={toggle.id} className="flex items-center justify-between py-4">
                    <div>
                      <p className="font-medium text-gray-900">{toggle.label}</p>
                      <p className="text-sm text-gray-500">{toggle.description}</p>
                    </div>
                    <Switch
                      checked={notifications[toggle.id]}
                      onCheckedChange={(val) =>
                        setNotifications((prev) => ({ ...prev, [toggle.id]: val }))
                      }
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-2 border-t border-gray-200 pt-4">
                <Button onClick={handleSave} disabled={saving}>
                  <Save size={14} />
                  {saving ? 'Saving...' : 'Save Preferences'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Email Templates Tab ── */}
        <TabsContent value="templates">
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-gray-100">
                {EMAIL_TEMPLATES.map((template) => (
                  <div key={template} className="flex items-center justify-between py-3.5">
                    <p className="font-medium text-gray-900">{template}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingTemplate(template)}
                    >
                      <Edit2 size={13} />
                      Edit
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Users Tab ── */}
        <TabsContent value="users">
          <Card className="max-w-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Team Members</CardTitle>
                <Button size="sm">
                  <Plus size={14} />
                  Add User
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                      <th className="pb-3 pr-4">Name</th>
                      <th className="pb-3 pr-4">Email</th>
                      <th className="pb-3 pr-4">Role</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {USERS.map((user) => (
                      <tr key={user.email} className="hover:bg-gray-50">
                        <td className="py-3 pr-4 font-medium text-gray-900">{user.name}</td>
                        <td className="py-3 pr-4 text-gray-600">{user.email}</td>
                        <td className="py-3 pr-4">
                          <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className="inline-flex rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                            {user.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
