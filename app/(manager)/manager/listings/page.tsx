import { Building2, Bed, Bath, Square, ExternalLink, ClipboardCopy, FileText } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { getUnits } from '@/lib/actions/unit-actions'
import { getProperties } from '@/lib/actions/property-actions'
import { UnitStatus } from '@/types'
import Link from 'next/link'
import { ListingCard } from './listing-card'

export default async function ListingsPage() {
  const [unitsResult, propertiesResult] = await Promise.all([
    getUnits(),
    getProperties(),
  ])

  const allUnits = unitsResult.success ? unitsResult.data : []
  const properties = propertiesResult.success ? propertiesResult.data : []
  const propertyMap = Object.fromEntries(properties.map((p) => [p.id, p]))

  const vacantUnits = allUnits.filter((u) => u.status === UnitStatus.VACANT)

  return (
    <div>
      <PageHeader
        title="Listings"
        description="Fall 2027 Pre-Leasing — actively marketing available units"
      />

      {/* Listings Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-12">
        {vacantUnits.map((unit) => {
          const property = propertyMap[unit.propertyId]
          return (
            <ListingCard
              key={unit.id}
              unit={unit}
              propertyName={property?.name ?? 'Unknown Property'}
            />
          )
        })}
        {vacantUnits.length === 0 && (
          <div className="col-span-3 rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
            <Building2 size={32} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-400 text-sm">No vacant units at this time.</p>
          </div>
        )}
      </div>

      {/* Syndication */}
      <div className="border-t border-gray-200 pt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Listing Syndication</h2>
        <p className="text-sm text-gray-500 mb-6">
          Connect to listing platforms to automatically publish your vacancies.
        </p>
        <SyndicationSection />
      </div>
    </div>
  )
}

function SyndicationSection() {
  const platforms = [
    {
      name: 'Zillow Rental Manager',
      logo: '🏠',
      description: 'Reach millions of renters on Zillow, Trulia, and HotPads.',
      status: 'Not Connected',
    },
    {
      name: 'Apartments.com',
      logo: '🏢',
      description: 'List on Apartments.com, ApartmentFinder, and ForRent.',
      status: 'Not Connected',
    },
    {
      name: 'Zumper',
      logo: '🔑',
      description: 'Post to Zumper and PadMapper for rapid exposure.',
      status: 'Not Connected',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {platforms.map((p) => (
        <div
          key={p.name}
          className="rounded-xl bg-white shadow-sm ring-1 ring-gray-200 p-6 flex flex-col gap-4"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{p.logo}</span>
            <div>
              <p className="text-sm font-semibold text-gray-900">{p.name}</p>
              <span className="text-xs text-gray-400">{p.status}</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 flex-1">{p.description}</p>
          <ConnectButton platform={p.name} />
        </div>
      ))}
    </div>
  )
}

// Client component for toast
import { ConnectButton } from './connect-button'
