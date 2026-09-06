'use client'

import { useRouter } from 'next/navigation'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import { cn } from 'cn'
import { DataTable, type Column, type RowAction } from '@/components/shared/data-table'
import { StatusBadge } from '@/components/shared/status-badge'
import { deleteTenant } from '@/lib/actions/tenant-actions'
import { formatDate } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TenantRow {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  unitLabel?: string
  leaseStatus?: string
  moveInDate?: Date
  createdAt: Date
  updatedAt: Date
  [key: string]: unknown
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function TenantAvatar({ firstName, lastName }: { firstName: string; lastName: string }) {
  const initials = `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase()
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
        {initials}
      </div>
      <span className="font-medium text-gray-900">
        {firstName} {lastName}
      </span>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

interface TenantTableProps {
  rows: TenantRow[]
}

export function TenantTable({ rows }: TenantTableProps) {
  const router = useRouter()

  const columns: Column<TenantRow>[] = [
    {
      key: 'firstName',
      label: 'Name',
      sortable: true,
      render: (_, row) => (
        <TenantAvatar firstName={row.firstName} lastName={row.lastName} />
      ),
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      render: (val) => (
        <a
          href={`mailto:${val as string}`}
          className="text-blue-600 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {val as string}
        </a>
      ),
    },
    {
      key: 'phone',
      label: 'Phone',
      sortable: false,
    },
    {
      key: 'unitLabel',
      label: 'Current Unit',
      sortable: true,
      render: (val) =>
        val ? (
          <span className="text-gray-700">{val as string}</span>
        ) : (
          <span className="text-gray-400 text-xs">No active lease</span>
        ),
    },
    {
      key: 'leaseStatus',
      label: 'Lease Status',
      sortable: true,
      render: (val) =>
        val ? (
          <StatusBadge status={val as string} />
        ) : (
          <span className="text-gray-400 text-xs">—</span>
        ),
    },
    {
      key: 'moveInDate',
      label: 'Move-in Date',
      sortable: true,
      render: (val) =>
        val ? (
          <span>{formatDate(val as Date)}</span>
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
  ]

  const rowActions = (row: TenantRow): RowAction[] => [
    {
      label: 'View Profile',
      onClick: () => router.push(`/manager/tenants/${row.id}`),
    },
    {
      label: 'Edit',
      onClick: () => router.push(`/manager/tenants/${row.id}/edit`),
    },
    {
      label: 'Delete',
      variant: 'destructive',
      onClick: async () => {
        if (confirm(`Delete ${row.firstName} ${row.lastName}? This cannot be undone.`)) {
          await deleteTenant(row.id)
        }
      },
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={rows}
      searchPlaceholder="Search tenants..."
      onRowClick={(row) => router.push(`/manager/tenants/${row.id}`)}
      rowActions={rowActions}
    />
  )
}
