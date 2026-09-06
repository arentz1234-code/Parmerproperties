import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Pencil, Plus, MapPin, Building2, Calendar } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { getPropertyWithUnits } from '@/lib/mock-data'
import { getMaintenanceRequests } from '@/lib/actions/maintenance-actions'
import { UnitsTable } from '@/components/properties/units-table'
import { UnitStatus, MaintenanceStatus, MaintenanceRequest } from '@/types'

interface Props {
  params: Promise<{ propertyId: string }>
}

const TYPE_LABELS: Record<string, string> = {
  APARTMENT: 'Apartment',
  HOUSE: 'House',
  COMMERCIAL: 'Commercial',
  CONDO: 'Condo',
  TOWNHOUSE: 'Townhouse',
}

export default async function PropertyDetailPage({ params }: Props) {
  const { propertyId } = await params

  let propertyWithUnits
  try {
    propertyWithUnits = getPropertyWithUnits(propertyId)
  } catch (e) {
    console.error('Failed to load property:', e)
  }

  if (!propertyWithUnits) notFound()

  const { units, ...property } = propertyWithUnits

  // Unit status summary
  const occupied = units.filter((u) => u.status === UnitStatus.OCCUPIED).length
  const vacant = units.filter((u) => u.status === UnitStatus.VACANT).length
  const notice = units.filter((u) => u.status === UnitStatus.NOTICE).length
  const maintenance = units.filter((u) => u.status === UnitStatus.MAINTENANCE).length
  const occupancyRate = units.length > 0 ? Math.round((occupied / units.length) * 100) : 0

  // Maintenance requests for this property
  let maintenanceRequests: MaintenanceRequest[] = []
  try {
    const result = await getMaintenanceRequests({ propertyId: property.id })
    if (result.success) maintenanceRequests = result.data
  } catch {
    // silently handle
  }
  const openMaintenance = maintenanceRequests.filter(
    (m) => m.status === MaintenanceStatus.OPEN || m.status === MaintenanceStatus.IN_PROGRESS,
  ).length

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={property.name}
        description={`${property.address}, ${property.city}, ${property.state} ${property.zip}`}
      >
        <Link href={`/manager/properties/${property.id}/edit`} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
          <Pencil size={13} />
          Edit
        </Link>
        <Link href={`/manager/properties/${property.id}/units/new`} className={buttonVariants({ size: 'sm' })}>
          <Plus size={13} />
          Add Unit
        </Link>
      </PageHeader>

      {/* Property overview card */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Details card */}
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200 flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-gray-900">Property Details</h2>
          <dl className="flex flex-col gap-3">
            <div className="flex items-start gap-2.5">
              <MapPin size={14} className="mt-0.5 shrink-0 text-gray-400" />
              <div>
                <dt className="text-xs text-gray-400">Address</dt>
                <dd className="text-sm text-gray-700">
                  {property.address}<br />
                  {property.city}, {property.state} {property.zip}
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Building2 size={14} className="mt-0.5 shrink-0 text-gray-400" />
              <div>
                <dt className="text-xs text-gray-400">Type</dt>
                <dd className="mt-0.5">
                  <StatusBadge
                    status={property.type}
                    type="custom"
                    customClass="bg-blue-100 text-blue-700"
                  />
                </dd>
              </div>
            </div>
            {property.yearBuilt && (
              <div className="flex items-start gap-2.5">
                <Calendar size={14} className="mt-0.5 shrink-0 text-gray-400" />
                <div>
                  <dt className="text-xs text-gray-400">Year Built</dt>
                  <dd className="text-sm text-gray-700">{property.yearBuilt}</dd>
                </div>
              </div>
            )}
            {property.description && (
              <div className="pt-1 border-t border-gray-100">
                <p className="text-xs text-gray-500 leading-relaxed">{property.description}</p>
              </div>
            )}
          </dl>
        </div>

        {/* Unit stats */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4 sm:grid-cols-4 content-start">
          {[
            { label: 'Total Units', value: units.length, color: 'text-gray-900' },
            { label: 'Occupied', value: occupied, color: 'text-green-700' },
            { label: 'Vacant', value: vacant, color: vacant > 0 ? 'text-red-700' : 'text-gray-500' },
            { label: 'Occupancy', value: `${occupancyRate}%`, color: 'text-blue-700' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200 text-center"
            >
              <p className={`text-2xl font-bold tabular-nums leading-none ${stat.color}`}>
                {stat.value}
              </p>
              <p className="mt-1.5 text-xs text-gray-500">{stat.label}</p>
            </div>
          ))}
          {notice > 0 && (
            <div className="rounded-xl bg-yellow-50 p-4 ring-1 ring-yellow-200 text-center">
              <p className="text-2xl font-bold tabular-nums leading-none text-yellow-700">{notice}</p>
              <p className="mt-1.5 text-xs text-yellow-600">Notice</p>
            </div>
          )}
          {openMaintenance > 0 && (
            <div className="rounded-xl bg-orange-50 p-4 ring-1 ring-orange-200 text-center">
              <p className="text-2xl font-bold tabular-nums leading-none text-orange-700">{openMaintenance}</p>
              <p className="mt-1.5 text-xs text-orange-600">Open Maintenance</p>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="units">
        <TabsList variant="line">
          <TabsTrigger value="units">Units ({units.length})</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance ({maintenanceRequests.length})</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="units" className="mt-4">
          <UnitsTable units={units} propertyId={property.id} />
        </TabsContent>

        <TabsContent value="maintenance" className="mt-4">
          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            {maintenanceRequests.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-8">
                No maintenance requests for this property.
              </p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {maintenanceRequests.map((req) => (
                  <li key={req.id} className="flex items-start gap-3 py-3 first:pt-0">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <StatusBadge status={req.priority} type="priority" />
                        <StatusBadge status={req.status} />
                      </div>
                      <p className="text-sm font-medium text-gray-800">{req.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Unit {req.unitId.split('_').pop()?.toUpperCase()} · {req.category}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <p className="text-center text-sm text-gray-400 py-8">
              Document management coming soon.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
