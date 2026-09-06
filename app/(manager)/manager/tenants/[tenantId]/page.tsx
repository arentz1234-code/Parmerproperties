import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Pencil,
  User,
  Home,
  DollarSign,
  Wrench,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { buttonVariants } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/status-badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { getTenantById } from '@/lib/actions/tenant-actions'
import { getPaymentsByTenant } from '@/lib/actions/payment-actions'
import { leases } from '@/lib/mock-data/leases'
import { units } from '@/lib/mock-data/units'
import { properties } from '@/lib/mock-data/properties'
import { maintenanceRequests } from '@/lib/mock-data/maintenance'
import { formatCurrency, formatDate, getInitials } from '@/lib/utils'
import { LeaseStatus, PaymentStatus, type EmergencyContact } from '@/types'

// ─── Info Row ─────────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500 shrink-0">{label}</span>
      <span className="text-sm font-medium text-gray-900 text-right">{value}</span>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function TenantProfilePage({
  params,
}: {
  params: Promise<{ tenantId: string }>
}) {
  const { tenantId } = await params

  const [tenantResult, paymentsResult] = await Promise.all([
    getTenantById(tenantId),
    getPaymentsByTenant(tenantId),
  ])

  if (!tenantResult.success) notFound()

  const tenant = tenantResult.data
  const payments = paymentsResult.success ? paymentsResult.data : []

  // All leases for this tenant
  const tenantLeases = leases.filter((l) => l.tenantId === tenantId)
  const activeLease = tenantLeases.find((l) => l.status === LeaseStatus.ACTIVE)

  // Unit + property for active lease
  const activeUnit = activeLease ? units.find((u) => u.id === activeLease.unitId) : undefined
  const activeProperty = activeUnit
    ? properties.find((p) => p.id === activeUnit.propertyId)
    : undefined

  // Maintenance requests for active unit
  const maintenance = activeUnit
    ? maintenanceRequests.filter((m) => m.unitId === activeUnit.id)
    : []

  // Running balance
  let runningBalance = 0
  const sortedPayments = [...payments].sort(
    (a, b) => a.dueDate.getTime() - b.dueDate.getTime(),
  )

  const fullName = `${tenant.firstName} ${tenant.lastName}`
  const initials = getInitials(fullName)
  const emergencyContacts = tenant.emergencyContacts as EmergencyContact[]

  return (
    <div>
      <PageHeader title="" description="">
        <Link href="/manager/tenants" className={buttonVariants({ variant: 'outline' })}>
          <ArrowLeft size={14} />
          All Tenants
        </Link>
        <Link href={`/manager/tenants/${tenantId}/edit`} className={buttonVariants({})}>
          <Pencil size={14} />
          Edit Tenant
        </Link>
      </PageHeader>

      {/* Profile Header */}
      <div className="mb-6 flex items-start gap-5">
        <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-xl font-bold text-blue-700">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">{fullName}</h1>
            <span className="inline-flex items-center rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-700">
              Tenant
            </span>
            {activeLease && <StatusBadge status={activeLease.status} />}
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <Mail size={13} /> {tenant.email}
            </span>
            <span className="flex items-center gap-1.5">
              <Phone size={13} /> {tenant.phone}
            </span>
            {activeUnit && activeProperty && (
              <span className="flex items-center gap-1.5">
                <MapPin size={13} /> {activeProperty.name} — Unit {activeUnit.unitNumber}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList variant="line" className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="lease">Lease</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        {/* ── Overview ── */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <User size={14} className="text-blue-500" /> Contact Info
                </CardTitle>
              </CardHeader>
              <CardContent>
                <InfoRow label="Full Name" value={fullName} />
                <InfoRow
                  label="Email"
                  value={
                    <a href={`mailto:${tenant.email}`} className="text-blue-600 hover:underline">
                      {tenant.email}
                    </a>
                  }
                />
                <InfoRow label="Phone" value={tenant.phone} />
                <InfoRow
                  label="Date of Birth"
                  value={
                    tenant.dateOfBirth ? formatDate(tenant.dateOfBirth) : <span className="text-gray-400">—</span>
                  }
                />
                <InfoRow
                  label="Tenant Since"
                  value={formatDate(tenant.createdAt)}
                />
              </CardContent>
            </Card>

            {/* Emergency Contacts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <Phone size={14} className="text-red-500" /> Emergency Contacts
                </CardTitle>
              </CardHeader>
              <CardContent>
                {emergencyContacts.length === 0 ? (
                  <p className="text-sm text-gray-400">No emergency contacts on file.</p>
                ) : (
                  <div className="space-y-3">
                    {emergencyContacts.map((contact, i) => (
                      <div key={i} className="rounded-lg bg-gray-50 p-3">
                        <p className="text-sm font-medium text-gray-900">{contact.name}</p>
                        <p className="text-xs text-gray-500">{contact.relationship}</p>
                        <a
                          href={`tel:${contact.phone}`}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          {contact.phone}
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Current Lease Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <Home size={14} className="text-green-500" /> Current Lease
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeLease && activeUnit && activeProperty ? (
                  <>
                    <InfoRow label="Property" value={activeProperty.name} />
                    <InfoRow label="Unit" value={`Unit ${activeUnit.unitNumber}`} />
                    <InfoRow label="Monthly Rent" value={formatCurrency(activeLease.rentAmount)} />
                    <InfoRow label="Lease Start" value={formatDate(activeLease.startDate)} />
                    <InfoRow label="Lease End" value={formatDate(activeLease.endDate)} />
                    <InfoRow label="Status" value={<StatusBadge status={activeLease.status} />} />
                    <div className="mt-3">
                      <Link
                        href={`/manager/leases/${activeLease.id}`}
                        className="text-xs font-medium text-blue-600 hover:underline"
                      >
                        View full lease details →
                      </Link>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-400">No active lease found.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Lease ── */}
        <TabsContent value="lease">
          <div className="space-y-5">
            {tenantLeases.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center text-sm text-gray-400">
                  No lease records found for this tenant.
                </CardContent>
              </Card>
            ) : (
              tenantLeases.map((lease) => {
                const unit = units.find((u) => u.id === lease.unitId)
                const property = unit ? properties.find((p) => p.id === unit.propertyId) : undefined
                return (
                  <Card key={lease.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="text-sm font-semibold">
                          {property?.name ?? 'Unknown'} — Unit {unit?.unitNumber ?? '?'}
                        </span>
                        <StatusBadge status={lease.status} />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <div>
                          <p className="text-xs text-gray-500">Monthly Rent</p>
                          <p className="text-sm font-semibold text-gray-900">{formatCurrency(lease.rentAmount)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Deposit</p>
                          <p className="text-sm font-semibold text-gray-900">{formatCurrency(lease.deposit)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Start Date</p>
                          <p className="text-sm font-semibold text-gray-900">{formatDate(lease.startDate)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">End Date</p>
                          <p className="text-sm font-semibold text-gray-900">{formatDate(lease.endDate)}</p>
                        </div>
                      </div>
                      {lease.notes && (
                        <p className="mt-3 text-sm text-gray-600 border-t border-gray-100 pt-3">
                          {lease.notes}
                        </p>
                      )}
                      <div className="mt-3">
                        <Link
                          href={`/manager/leases/${lease.id}`}
                          className="text-xs font-medium text-blue-600 hover:underline"
                        >
                          View lease details →
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </TabsContent>

        {/* ── Payments ── */}
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <DollarSign size={14} className="text-green-500" /> Payment History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {sortedPayments.length === 0 ? (
                <p className="py-10 text-center text-sm text-gray-400">No payments on record.</p>
              ) : (
                <div className="overflow-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        {['Due Date', 'Amount Due', 'Paid', 'Balance', 'Status', 'Method'].map((h) => (
                          <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {sortedPayments.map((payment) => {
                        runningBalance += payment.amountDue - payment.amount
                        return (
                          <tr key={payment.id} className="bg-white hover:bg-gray-50">
                            <td className="px-4 py-3">{formatDate(payment.dueDate)}</td>
                            <td className="px-4 py-3">{formatCurrency(payment.amountDue)}</td>
                            <td className="px-4 py-3">
                              {payment.paidAt ? formatDate(payment.paidAt) : <span className="text-gray-400">—</span>}
                            </td>
                            <td className={`px-4 py-3 font-medium ${payment.status === PaymentStatus.PAID ? 'text-green-700' : 'text-red-600'}`}>
                              {formatCurrency(payment.amountDue - payment.amount)}
                            </td>
                            <td className="px-4 py-3">
                              <StatusBadge status={payment.status} />
                            </td>
                            <td className="px-4 py-3 text-gray-500">
                              {payment.method?.replace('_', ' ') ?? '—'}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Maintenance ── */}
        <TabsContent value="maintenance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Wrench size={14} className="text-orange-500" /> Maintenance Requests
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {maintenance.length === 0 ? (
                <p className="py-10 text-center text-sm text-gray-400">
                  {activeUnit
                    ? 'No maintenance requests for this unit.'
                    : 'No active unit — no maintenance requests.'}
                </p>
              ) : (
                <div className="overflow-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        {['Title', 'Category', 'Priority', 'Status', 'Created'].map((h) => (
                          <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {maintenance.map((req) => (
                        <tr key={req.id} className="bg-white hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">{req.title}</td>
                          <td className="px-4 py-3 text-gray-600">{req.category}</td>
                          <td className="px-4 py-3">
                            <StatusBadge status={req.priority} type="priority" />
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={req.status} />
                          </td>
                          <td className="px-4 py-3 text-gray-500">{formatDate(req.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Documents ── */}
        <TabsContent value="documents">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-sm text-gray-400">Document management coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
