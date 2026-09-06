'use client'

import { useRouter } from 'next/navigation'
import { cn } from 'cn'
import { DataTable, type Column, type RowAction } from '@/components/shared/data-table'
import { StatusBadge } from '@/components/shared/status-badge'
import { terminateLease } from '@/lib/actions/lease-actions'
import { formatCurrency, formatDate } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LeaseRow {
  id: string
  tenantName: string
  propertyUnit: string
  startDate: Date
  endDate: Date
  rentAmount: number
  status: string
  daysRemaining: number
  unitId: string
  tenantId: string
  [key: string]: unknown
}

// ─── Days Remaining Badge ─────────────────────────────────────────────────────

function DaysRemainingBadge({ days, status }: { days: number; status: string }) {
  if (status !== 'ACTIVE') {
    return <span className="text-gray-400 text-xs">—</span>
  }
  if (days < 0) {
    return <span className="text-xs font-medium text-red-600">Expired</span>
  }
  const colorClass =
    days > 60
      ? 'text-green-700 bg-green-50'
      : days >= 30
      ? 'text-yellow-700 bg-yellow-50'
      : 'text-red-700 bg-red-50'

  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', colorClass)}>
      {days}d left
    </span>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

interface LeaseTableProps {
  rows: LeaseRow[]
}

export function LeaseTable({ rows }: LeaseTableProps) {
  const router = useRouter()

  const columns: Column<LeaseRow>[] = [
    {
      key: 'tenantName',
      label: 'Tenant',
      sortable: true,
      render: (val) => <span className="font-medium text-gray-900">{val as string}</span>,
    },
    {
      key: 'propertyUnit',
      label: 'Property / Unit',
      sortable: true,
    },
    {
      key: 'startDate',
      label: 'Start Date',
      sortable: true,
      render: (val) => formatDate(val as Date),
    },
    {
      key: 'endDate',
      label: 'End Date',
      sortable: true,
      render: (val) => formatDate(val as Date),
    },
    {
      key: 'rentAmount',
      label: 'Rent',
      sortable: true,
      render: (val) => (
        <span className="font-medium text-gray-900">{formatCurrency(val as number)}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (val) => <StatusBadge status={val as string} />,
    },
    {
      key: 'daysRemaining',
      label: 'Days Remaining',
      sortable: true,
      render: (val, row) => (
        <DaysRemainingBadge days={val as number} status={row.status} />
      ),
    },
  ]

  const rowActions = (row: LeaseRow): RowAction[] => [
    {
      label: 'View',
      onClick: () => router.push(`/manager/leases/${row.id}`),
    },
    {
      label: 'Edit',
      onClick: () => router.push(`/manager/leases/${row.id}/edit`),
    },
    {
      label: 'Renew',
      onClick: () => router.push(`/manager/leases/${row.id}/renew`),
    },
    {
      label: 'Terminate',
      variant: 'destructive',
      onClick: async () => {
        if (confirm('Terminate this lease? The unit status will be set to Notice.')) {
          await terminateLease(row.id)
        }
      },
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={rows}
      searchPlaceholder="Search leases..."
      onRowClick={(row) => router.push(`/manager/leases/${row.id}`)}
      rowActions={rowActions}
    />
  )
}
