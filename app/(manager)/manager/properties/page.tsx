import Link from 'next/link'
import { Plus } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/page-header'
import { PropertyCard } from '@/components/properties/property-card'
import { getProperties } from '@/lib/actions/property-actions'
import { units } from '@/lib/mock-data'
import { UnitStatus, type Property } from '@/types'

export default async function PropertiesPage() {
  let properties: Property[] = []

  try {
    const result = await getProperties()
    if (result.success) {
      properties = result.data
    }
  } catch (e) {
    console.error('Failed to load properties:', e)
  }

  // Compute stats per property from mock unit data
  const propertyStats = properties.map((property) => {
    const propUnits = units.filter((u) => u.propertyId === property.id)
    const total = propUnits.length
    const occupied = propUnits.filter((u) => u.status === UnitStatus.OCCUPIED).length
    const vacant = propUnits.filter((u) => u.status === UnitStatus.VACANT).length
    const notice = propUnits.filter((u) => u.status === UnitStatus.NOTICE).length
    const avgRent =
      total > 0
        ? propUnits.reduce((sum, u) => sum + u.rentAmount, 0) / total
        : 0
    const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0

    return {
      property,
      stats: { total, occupied, vacant, notice, avgRent, occupancyRate },
    }
  })

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Properties" description="Manage your property portfolio">
        <Link href="/manager/properties/new" className={buttonVariants({})}>
          <Plus size={15} />
          Add Property
        </Link>
      </PageHeader>

      {propertyStats.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-200 py-20 text-center">
          <p className="text-sm font-medium text-gray-500">No properties yet</p>
          <p className="text-xs text-gray-400">Add your first property to get started.</p>
          <Link href="/manager/properties/new" className={buttonVariants({ size: 'sm' }) + ' mt-2'}>
            <Plus size={13} /> Add Property
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {propertyStats.map(({ property, stats }) => (
            <PropertyCard
              key={property.id}
              property={property}
              stats={stats}
            />
          ))}
        </div>
      )}
    </div>
  )
}
