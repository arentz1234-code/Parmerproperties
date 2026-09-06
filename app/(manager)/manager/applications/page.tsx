import Link from 'next/link'
import { CheckCircle, XCircle, Eye, MinusCircle } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { getApplications } from '@/lib/actions/application-actions'
import { ApplicationStatus } from '@/types'
import { cn } from 'cn'

const TABS = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Denied', value: 'DENIED' },
  { label: 'Withdrawn', value: 'WITHDRAWN' },
]

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const result = await getApplications(
    status ? { status: status as ApplicationStatus } : undefined,
  )
  const applications = result.success ? result.data : []

  return (
    <div>
      <PageHeader title="Applications">
        <Link
          href="/apply"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          target="_blank"
        >
          View Public Portal
        </Link>
      </PageHeader>

      {/* Filter Tabs */}
      <div className="mb-6 flex gap-1 border-b border-gray-200">
        {TABS.map((tab) => (
          <Link
            key={tab.value}
            href={tab.value ? `/manager/applications?status=${tab.value}` : '/manager/applications'}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-t-md transition-colors border-b-2',
              (status ?? '') === tab.value
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700',
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Applicant', 'Email', 'Phone', 'Unit Applied For', 'Income', 'Status', 'Submitted', 'Actions'].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {applications.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-gray-400">
                    No applications found.
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                      {app.applicantName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {app.applicantEmail}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {app.applicantPhone}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                        {app.unitId}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {app.income ? `$${app.income.toLocaleString()}/yr` : 'N/A'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                      {app.submittedAt.toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/manager/applications/${app.id}`}
                          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                          <Eye size={13} />
                          View
                        </Link>
                        {app.status === ApplicationStatus.PENDING && (
                          <>
                            <Link
                              href={`/manager/applications/${app.id}?action=approve`}
                              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-50 transition-colors"
                            >
                              <CheckCircle size={13} />
                              Approve
                            </Link>
                            <Link
                              href={`/manager/applications/${app.id}?action=deny`}
                              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50 transition-colors"
                            >
                              <XCircle size={13} />
                              Deny
                            </Link>
                            <Link
                              href={`/manager/applications/${app.id}?action=withdraw`}
                              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 transition-colors"
                            >
                              <MinusCircle size={13} />
                              Withdraw
                            </Link>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
