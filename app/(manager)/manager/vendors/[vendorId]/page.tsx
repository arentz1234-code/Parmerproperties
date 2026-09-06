import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Pencil, Star, Shield, Phone, Mail, MapPin, FileText, Wrench } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { getVendorById } from '@/lib/actions/vendor-actions'
import { getMaintenanceRequests } from '@/lib/actions/maintenance-actions'
import { VENDOR_TRADES } from '@/lib/constants'
import { formatCurrency, formatDate } from '@/lib/utils'
import { cn } from 'cn'

function StarRating({ rating }: { rating?: number }) {
  const r = rating ?? 0
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={16}
          className={i <= Math.round(r) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
        />
      ))}
      <span className="ml-1 text-sm text-gray-600">{r > 0 ? r.toFixed(1) : '—'}</span>
    </span>
  )
}

interface PageProps {
  params: Promise<{ vendorId: string }>
}

export default async function VendorDetailPage({ params }: PageProps) {
  const { vendorId } = await params

  const vendorResult = await getVendorById(vendorId)
  if (!vendorResult.success) notFound()
  const vendor = vendorResult.data

  const maintResult = await getMaintenanceRequests()
  const allRequests = maintResult.success ? maintResult.data : []
  const vendorRequests = allRequests.filter((r) => r.vendorId === vendorId)

  // Annual payments total (simulated)
  const annualTotal = vendorRequests.reduce((sum, r) => sum + (r.actualCost ?? r.estimatedCost ?? 0), 0)

  const tradeLabel =
    VENDOR_TRADES.find((t) => t.value === vendor.trade)?.label ?? vendor.trade

  return (
    <div>
      <PageHeader title={vendor.name} description={tradeLabel}>
        <Link
          href={`/manager/vendors/${vendorId}/edit`}
          className={cn(buttonVariants({ variant: 'outline' }))}
        >
          <Pencil size={14} />
          Edit Vendor
        </Link>
      </PageHeader>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Contact Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Wrench size={16} className="shrink-0 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Trade</p>
                <p className="font-medium text-gray-900">{tradeLabel}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <FileText size={16} className="shrink-0 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Contact Person</p>
                <p className="font-medium text-gray-900">{vendor.contactName}</p>
              </div>
            </div>

            {vendor.phone && (
              <div className="flex items-center gap-3">
                <Phone size={16} className="shrink-0 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="font-medium text-gray-900">{vendor.phone}</p>
                </div>
              </div>
            )}

            {vendor.email && (
              <div className="flex items-center gap-3">
                <Mail size={16} className="shrink-0 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{vendor.email}</p>
                </div>
              </div>
            )}

            {vendor.address && (
              <div className="flex items-center gap-3">
                <MapPin size={16} className="shrink-0 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Address</p>
                  <p className="font-medium text-gray-900">{vendor.address}</p>
                </div>
              </div>
            )}

            {vendor.licenseNumber && (
              <div className="flex items-center gap-3">
                <FileText size={16} className="shrink-0 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">License Number</p>
                  <p className="font-medium text-gray-900">{vendor.licenseNumber}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Shield size={16} className="shrink-0 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Insurance</p>
                {vendor.insured ? (
                  <span className="inline-flex rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                    Insured
                  </span>
                ) : (
                  <span className="inline-flex rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-600">
                    Not Insured
                  </span>
                )}
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">Rating</p>
              <StarRating rating={vendor.rating} />
            </div>

            {vendor.notes && (
              <div>
                <p className="text-xs text-gray-500">Notes</p>
                <p className="mt-0.5 text-sm text-gray-700">{vendor.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Work History Card */}
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Work History</CardTitle>
            </CardHeader>
            <CardContent>
              {vendorRequests.length === 0 ? (
                <p className="text-sm text-gray-500">No maintenance requests assigned to this vendor yet.</p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {vendorRequests.map((req) => (
                    <div key={req.id} className="py-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{req.title}</p>
                          <p className="text-xs text-gray-500">
                            Unit: {req.unitId} &middot; {formatDate(req.createdAt)}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          {req.actualCost != null ? (
                            <p className="text-sm font-semibold text-gray-900">
                              {formatCurrency(req.actualCost)}
                            </p>
                          ) : req.estimatedCost != null ? (
                            <p className="text-sm text-gray-500">
                              Est. {formatCurrency(req.estimatedCost)}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 1099 Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Annual Payments (1099)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total payments YTD (2026)</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(annualTotal)}</p>
                </div>
                {annualTotal >= 600 && (
                  <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700">
                    1099 Required
                  </span>
                )}
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Vendors paid $600 or more in a calendar year require a 1099-NEC filing.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
