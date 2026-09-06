import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Plus,
  Wrench,
  ChevronDown,
  Calendar,
  User,
  Clock,
} from 'lucide-react'
import { maintenanceRequests } from '@/lib/mock-data/maintenance'
import { vendors } from '@/lib/mock-data/vendors'
import { tenants } from '@/lib/mock-data/tenants'
import { formatDate } from '@/lib/utils'
import { MaintenancePriority, MaintenanceStatus } from '@/types'
import { TenantMaintenanceList } from './maintenance-list'

function getPriorityDot(priority: string) {
  if (priority === MaintenancePriority.EMERGENCY) return 'bg-red-500'
  if (priority === MaintenancePriority.HIGH) return 'bg-orange-500'
  if (priority === MaintenancePriority.MEDIUM) return 'bg-yellow-500'
  return 'bg-gray-400'
}

function getStatusBadge(status: string) {
  if (status === MaintenanceStatus.OPEN) return 'bg-blue-50 text-blue-700'
  if (status === MaintenanceStatus.IN_PROGRESS) return 'bg-indigo-50 text-indigo-700'
  if (status === MaintenanceStatus.PENDING_PARTS) return 'bg-orange-50 text-orange-700'
  if (status === MaintenanceStatus.COMPLETED) return 'bg-green-50 text-green-700'
  return 'bg-gray-50 text-gray-600'
}

function getStatusLabel(status: string) {
  if (status === MaintenanceStatus.OPEN) return 'Open'
  if (status === MaintenanceStatus.IN_PROGRESS) return 'In Progress'
  if (status === MaintenanceStatus.PENDING_PARTS) return 'Pending Parts'
  if (status === MaintenanceStatus.COMPLETED) return 'Completed'
  if (status === MaintenanceStatus.CANCELLED) return 'Cancelled'
  return status
}

export default async function TenantMaintenancePage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const userId = (session.user as { id?: string }).id ?? 'user_tenant_001'
  const tenant = tenants.find((t) => t.userId === userId) ?? tenants[0]
  const tenantId = tenant.id

  // Filter to this tenant's requests
  const myRequests = maintenanceRequests
    .filter((m) => m.requestedBy === tenantId || m.requestedBy === userId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

  // Enrich with vendor info
  const enriched = myRequests.map((req) => ({
    ...req,
    vendor: req.vendorId ? vendors.find((v) => v.id === req.vendorId) : undefined,
  }))

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Maintenance Requests</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track and submit repair requests for your unit.</p>
        </div>
        <Link
          href="/tenant/maintenance/new"
          className="flex items-center gap-2 rounded-xl bg-[#2d9d5c] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#238a4e] transition-colors shadow-sm"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Submit Request</span>
          <span className="sm:hidden">New</span>
        </Link>
      </div>

      {enriched.length === 0 ? (
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 p-12 flex flex-col items-center gap-4 text-center">
          <div className="size-16 rounded-full bg-gray-100 flex items-center justify-center">
            <Wrench size={28} className="text-gray-400" />
          </div>
          <div>
            <p className="font-semibold text-gray-700">No maintenance requests</p>
            <p className="text-sm text-gray-400 mt-1">Everything looks good! Submit a request if something needs attention.</p>
          </div>
          <Link
            href="/tenant/maintenance/new"
            className="rounded-xl bg-[#2d9d5c] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#238a4e] transition-colors"
          >
            Submit a Request
          </Link>
        </div>
      ) : (
        <TenantMaintenanceList requests={enriched} />
      )}
    </div>
  )
}
