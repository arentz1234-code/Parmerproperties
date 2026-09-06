import Link from 'next/link'
import { FolderOpen, Download, Trash2, Plus } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/status-badge'
import { buttonVariants } from '@/components/ui/button'
import { getDocuments } from '@/lib/actions/document-actions'
import { formatDate } from '@/lib/utils'
import { cn } from 'cn'

const CATEGORY_COLORS: Record<string, string> = {
  LEASE: 'bg-blue-100 text-blue-700',
  INSPECTION: 'bg-purple-100 text-purple-700',
  NOTICE: 'bg-orange-100 text-orange-700',
  RECEIPT: 'bg-green-100 text-green-700',
  PHOTO: 'bg-pink-100 text-pink-700',
  OTHER: 'bg-gray-100 text-gray-700',
}

const FILTER_TABS = ['All', 'Lease', 'Inspection', 'Notice', 'Receipt', 'Photo', 'Other']

export default async function DocumentsPage() {
  const result = await getDocuments()
  const documents = result.success ? result.data : []

  return (
    <div>
      <PageHeader title="Documents" description="Central document library for all properties">
        <Link href="/manager/documents/new" className={buttonVariants({})}>
          <Plus size={14} />
          Upload Document
        </Link>
      </PageHeader>

      {/* Filter Tabs (static display) */}
      <div className="mb-5 flex flex-wrap gap-2">
        {FILTER_TABS.map((tab) => (
          <span
            key={tab}
            className={cn(
              'rounded-full px-3 py-1 text-sm font-medium cursor-default',
              tab === 'All'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            )}
          >
            {tab}
          </span>
        ))}
      </div>

      {documents.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState
              icon={<FolderOpen size={28} />}
              title="No documents yet"
              description="Upload leases, inspection reports, notices, and other documents to keep everything organized."
              action={
                <Link href="/manager/documents/new" className={buttonVariants({})}>
                  <Plus size={14} />
                  Upload Document
                </Link>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    <th className="pb-3 pr-4">Name</th>
                    <th className="pb-3 pr-4">Category</th>
                    <th className="pb-3 pr-4">Associated With</th>
                    <th className="pb-3 pr-4">Uploaded</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50">
                      <td className="py-3 pr-4">
                        <p className="font-medium text-gray-900">{doc.name}</p>
                        <p className="text-xs text-gray-500">{doc.mimeType}</p>
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={cn(
                            'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
                            CATEGORY_COLORS[doc.category] ?? 'bg-gray-100 text-gray-700',
                          )}
                        >
                          {doc.category}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-gray-600 text-xs space-y-0.5">
                        {doc.propertyId && <p>Property: {doc.propertyId}</p>}
                        {doc.unitId && <p>Unit: {doc.unitId}</p>}
                        {doc.tenantId && <p>Tenant: {doc.tenantId}</p>}
                        {!doc.propertyId && !doc.unitId && !doc.tenantId && (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-gray-600">
                        {formatDate(doc.createdAt)}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <a
                            href={doc.url}
                            className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 border border-blue-200"
                          >
                            <Download size={11} />
                            Download
                          </a>
                          <button className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 border border-red-200">
                            <Trash2 size={11} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
