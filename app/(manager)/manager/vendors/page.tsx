import Link from 'next/link'
import { Plus, Star, Eye, Pencil, Trash2, Wrench } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Card, CardContent } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { getVendors } from '@/lib/actions/vendor-actions'
import { VENDOR_TRADES } from '@/lib/constants'
import { cn } from 'cn'

function StarRating({ rating }: { rating?: number }) {
  const r = rating ?? 0
  return (
    <span className="flex items-center gap-0.5 text-xs">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={12}
          className={i <= Math.round(r) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
        />
      ))}
      <span className="ml-1 text-gray-600">{r > 0 ? r.toFixed(1) : '—'}</span>
    </span>
  )
}

export default async function VendorsPage() {
  const result = await getVendors()
  const vendors = result.success ? result.data : []

  // Group by trade for the filter display (just showing all for now)
  const tradeLabel = (trade: string) =>
    VENDOR_TRADES.find((t) => t.value === trade)?.label ?? trade

  return (
    <div>
      <PageHeader title="Vendors" description="Manage your contractor and vendor directory">
        <Link href="/manager/vendors/new" className={buttonVariants({})}>
          <Plus size={14} />
          Add Vendor
        </Link>
      </PageHeader>

      {/* Trade Filter (static) */}
      <div className="mb-5 flex flex-wrap gap-2">
        <span className="rounded-full bg-gray-900 px-3 py-1 text-sm font-medium text-white">
          All Trades
        </span>
        {VENDOR_TRADES.slice(0, 6).map((t) => (
          <span
            key={t.value}
            className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-200 cursor-default"
          >
            {t.label}
          </span>
        ))}
      </div>

      {vendors.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState
              icon={<Wrench size={28} />}
              title="No vendors yet"
              description="Add contractors, repair services, and other vendors to your directory."
              action={
                <Link href="/manager/vendors/new" className={buttonVariants({})}>
                  <Plus size={14} />
                  Add Vendor
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
                    <th className="pb-3 pr-4">Company Name</th>
                    <th className="pb-3 pr-4">Trade</th>
                    <th className="pb-3 pr-4">Contact</th>
                    <th className="pb-3 pr-4">Phone</th>
                    <th className="pb-3 pr-4">Insured</th>
                    <th className="pb-3 pr-4">Rating</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {vendors.map((vendor) => (
                    <tr key={vendor.id} className="hover:bg-gray-50">
                      <td className="py-3 pr-4">
                        <p className="font-semibold text-gray-900">{vendor.name}</p>
                        {vendor.licenseNumber && (
                          <p className="text-xs text-gray-500">Lic: {vendor.licenseNumber}</p>
                        )}
                      </td>
                      <td className="py-3 pr-4">
                        <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                          {tradeLabel(vendor.trade)}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-gray-700">{vendor.contactName}</td>
                      <td className="py-3 pr-4 text-gray-600">{vendor.phone}</td>
                      <td className="py-3 pr-4">
                        {vendor.insured ? (
                          <span className="inline-flex rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                            Insured
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-600">
                            Not Insured
                          </span>
                        )}
                      </td>
                      <td className="py-3 pr-4">
                        <StarRating rating={vendor.rating} />
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/manager/vendors/${vendor.id}`}
                            className={cn(buttonVariants({ variant: 'outline', size: 'icon-sm' }))}
                            title="View"
                          >
                            <Eye size={13} />
                          </Link>
                          <Link
                            href={`/manager/vendors/${vendor.id}/edit`}
                            className={cn(buttonVariants({ variant: 'outline', size: 'icon-sm' }))}
                            title="Edit"
                          >
                            <Pencil size={13} />
                          </Link>
                          <button
                            className={cn(
                              buttonVariants({ variant: 'destructive', size: 'icon-sm' }),
                            )}
                            title="Delete"
                          >
                            <Trash2 size={13} />
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
