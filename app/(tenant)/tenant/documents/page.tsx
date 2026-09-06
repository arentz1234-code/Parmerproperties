import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import {
  FileText,
  Download,
  FolderOpen,
} from 'lucide-react'
import { tenants } from '@/lib/mock-data/tenants'
import { documents } from '@/lib/mock-data/documents'
import { formatDate } from '@/lib/utils'
import { DocumentCategory } from '@/types'
import type { Document } from '@/types'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

const CATEGORY_META: Record<DocumentCategory, { label: string; color: string; bg: string }> = {
  [DocumentCategory.LEASE]: { label: 'Lease', color: 'text-blue-700', bg: 'bg-blue-100' },
  [DocumentCategory.INSPECTION]: { label: 'Inspection', color: 'text-purple-700', bg: 'bg-purple-100' },
  [DocumentCategory.NOTICE]: { label: 'Notice', color: 'text-amber-700', bg: 'bg-amber-100' },
  [DocumentCategory.RECEIPT]: { label: 'Receipt', color: 'text-green-700', bg: 'bg-green-100' },
  [DocumentCategory.PHOTO]: { label: 'Photo', color: 'text-pink-700', bg: 'bg-pink-100' },
  [DocumentCategory.OTHER]: { label: 'Other', color: 'text-gray-700', bg: 'bg-gray-100' },
}

function formatBytes(bytes?: number) {
  if (!bytes) return null
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function DocumentCard({ doc }: { doc: Document }) {
  const meta = CATEGORY_META[doc.category] ?? CATEGORY_META[DocumentCategory.OTHER]
  const size = formatBytes(doc.sizeBytes)

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${meta.bg}`}>
          <FileText size={18} className={meta.color} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">
            {doc.name}
          </p>
          <div className="flex items-center gap-2 flex-wrap mt-1.5">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${meta.bg} ${meta.color}`}>
              {meta.label}
            </span>
            {size && <span className="text-xs text-gray-400">{size}</span>}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <p className="text-xs text-gray-400">{formatDate(doc.createdAt)}</p>
        <a
          href={doc.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2d9d5c] hover:underline"
        >
          <Download size={12} />
          Download
        </a>
      </div>
    </div>
  )
}

function DocGrid({ docs }: { docs: Document[] }) {
  if (docs.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-12 shadow-sm ring-1 ring-gray-200 text-center">
        <FolderOpen size={40} className="text-gray-200 mx-auto mb-3" />
        <p className="text-sm font-medium text-gray-600">No documents here yet</p>
        <p className="text-xs text-gray-400 mt-1">
          Documents shared with you will appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {docs.map((doc) => (
        <DocumentCard key={doc.id} doc={doc} />
      ))}
    </div>
  )
}

export default async function TenantDocumentsPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const userId = (session.user as { id?: string }).id ?? 'user_tenant_001'
  const tenant = tenants.find((t) => t.userId === userId) ?? tenants[0]
  const tenantId = tenant.id

  const tenantDocs = documents.filter((d) => d.tenantId === tenantId)

  const byCategory = {
    all: tenantDocs,
    lease: tenantDocs.filter((d) => d.category === DocumentCategory.LEASE),
    inspection: tenantDocs.filter((d) => d.category === DocumentCategory.INSPECTION),
    notice: tenantDocs.filter((d) => d.category === DocumentCategory.NOTICE),
    receipt: tenantDocs.filter((d) => d.category === DocumentCategory.RECEIPT),
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Documents</h1>
          <p className="text-gray-500 mt-0.5 text-sm">
            {tenantDocs.length} document{tenantDocs.length !== 1 ? 's' : ''} on file
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all">
        <TabsList className="mb-2">
          <TabsTrigger value="all">
            All ({byCategory.all.length})
          </TabsTrigger>
          <TabsTrigger value="lease">
            Lease ({byCategory.lease.length})
          </TabsTrigger>
          <TabsTrigger value="inspection">
            Inspection ({byCategory.inspection.length})
          </TabsTrigger>
          <TabsTrigger value="notice">
            Notices ({byCategory.notice.length})
          </TabsTrigger>
          <TabsTrigger value="receipt">
            Receipts ({byCategory.receipt.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <DocGrid docs={byCategory.all} />
        </TabsContent>
        <TabsContent value="lease">
          <DocGrid docs={byCategory.lease} />
        </TabsContent>
        <TabsContent value="inspection">
          <DocGrid docs={byCategory.inspection} />
        </TabsContent>
        <TabsContent value="notice">
          <DocGrid docs={byCategory.notice} />
        </TabsContent>
        <TabsContent value="receipt">
          <DocGrid docs={byCategory.receipt} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
