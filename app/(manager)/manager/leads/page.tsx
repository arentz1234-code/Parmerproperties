import Link from 'next/link'
import { Plus, Phone, Mail, LayoutGrid, List } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { getLeads } from '@/lib/actions/lead-actions'
import { Lead } from '@/types'
import { cn } from 'cn'

const COLUMNS: { id: Lead['status']; label: string; color: string }[] = [
  { id: 'NEW', label: 'New', color: 'bg-blue-100 border-blue-300' },
  { id: 'CONTACTED', label: 'Contacted', color: 'bg-indigo-100 border-indigo-300' },
  { id: 'TOURED', label: 'Toured', color: 'bg-purple-100 border-purple-300' },
  { id: 'APPLIED', label: 'Applied', color: 'bg-green-100 border-green-300' },
  { id: 'LOST', label: 'Lost', color: 'bg-gray-100 border-gray-300' },
]

const SOURCE_COLORS: Record<string, string> = {
  WEBSITE: 'bg-blue-100 text-blue-700',
  ZILLOW: 'bg-teal-100 text-teal-700',
  APARTMENTS_COM: 'bg-orange-100 text-orange-700',
  REFERRAL: 'bg-purple-100 text-purple-700',
  WALK_IN: 'bg-green-100 text-green-700',
  OTHER: 'bg-gray-100 text-gray-700',
}

function formatSource(s: string) {
  return s.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>
}) {
  const { view } = await searchParams
  const isTable = view === 'table'
  const result = await getLeads()
  const leads = result.success ? result.data : []

  const byStatus = (status: Lead['status']) => leads.filter((l) => l.status === status)

  return (
    <div>
      <PageHeader title="Leads">
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <Link
              href="/leads"
              className={cn(
                'px-3 py-1.5 text-sm transition-colors',
                !isTable ? 'bg-white text-gray-900 font-medium' : 'bg-gray-50 text-gray-500 hover:bg-white',
              )}
            >
              <LayoutGrid size={15} className="inline mr-1" />
              Board
            </Link>
            <Link
              href="/leads?view=table"
              className={cn(
                'px-3 py-1.5 text-sm transition-colors border-l border-gray-200',
                isTable ? 'bg-white text-gray-900 font-medium' : 'bg-gray-50 text-gray-500 hover:bg-white',
              )}
            >
              <List size={15} className="inline mr-1" />
              Table
            </Link>
          </div>
          <Link
            href="/leads/new"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            <Plus size={15} />
            Add Lead
          </Link>
        </div>
      </PageHeader>

      {!isTable ? (
        /* Kanban Board */
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((col) => {
            const colLeads = byStatus(col.id)
            return (
              <div
                key={col.id}
                className="flex-shrink-0 w-72 rounded-xl bg-gray-50 border border-gray-200 overflow-hidden"
              >
                <div className={cn('px-4 py-3 border-b border-gray-200 flex items-center justify-between', col.color)}>
                  <span className="text-sm font-semibold text-gray-800">{col.label}</span>
                  <span className="rounded-full bg-white/60 px-2 py-0.5 text-xs font-bold text-gray-700">
                    {colLeads.length}
                  </span>
                </div>
                <div className="p-3 space-y-3 min-h-32">
                  {colLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="rounded-lg bg-white shadow-sm ring-1 ring-gray-200 p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-sm font-semibold text-gray-900 leading-tight">{lead.name}</p>
                        <span
                          className={cn(
                            'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                            SOURCE_COLORS[lead.source] ?? 'bg-gray-100 text-gray-600',
                          )}
                        >
                          {formatSource(lead.source)}
                        </span>
                      </div>
                      {lead.propertyId && (
                        <p className="text-xs text-gray-500 mb-2 truncate">
                          {lead.propertyId.replace('prop_', '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                          {lead.unitId && ` — ${lead.unitId.split('_').pop()}`}
                        </p>
                      )}
                      {lead.phone && (
                        <p className="flex items-center gap-1 text-xs text-gray-500">
                          <Phone size={10} />
                          {lead.phone}
                        </p>
                      )}
                      <p className="mt-2 text-[10px] text-gray-400">
                        {lead.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                  {colLeads.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-4">No leads</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* Table View */
        <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Name', 'Interest', 'Source', 'Phone', 'Email', 'Status', 'Notes', 'Actions'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                      {lead.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {lead.propertyId ? (
                        <span>
                          {lead.propertyId.replace('prop_', '').replace(/_/g, ' ').toUpperCase()}
                          {lead.unitId && (
                            <span className="text-xs text-gray-400 ml-1">
                              ({lead.unitId.split('_').pop()})
                            </span>
                          )}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-xs font-medium',
                          SOURCE_COLORS[lead.source] ?? 'bg-gray-100 text-gray-600',
                        )}
                      >
                        {formatSource(lead.source)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {lead.phone ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {lead.email}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={lead.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">
                      {lead.notes ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <a
                          href={`mailto:${lead.email}`}
                          className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-100"
                        >
                          <Mail size={12} />
                          Email
                        </a>
                        {lead.phone && (
                          <a
                            href={`tel:${lead.phone}`}
                            className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-100"
                          >
                            <Phone size={12} />
                            Call
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {leads.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-sm text-gray-400">
                      No leads found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
