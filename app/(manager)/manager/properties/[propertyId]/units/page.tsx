import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/page-header'
import { UnitsTable } from '@/components/properties/units-table'
import { getPropertyWithUnits } from '@/lib/mock-data'

interface Props {
  params: Promise<{ propertyId: string }>
}

export default async function PropertyUnitsPage({ params }: Props) {
  const { propertyId } = await params

  let propertyWithUnits
  try {
    propertyWithUnits = getPropertyWithUnits(propertyId)
  } catch (e) {
    console.error('Failed to load property units:', e)
  }

  if (!propertyWithUnits) notFound()

  const { units, ...property } = propertyWithUnits

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`${property.name} — Units`}
        description={`${units.length} unit${units.length !== 1 ? 's' : ''} · ${property.address}, ${property.city}`}
      >
        <Link href={`/manager/properties/${propertyId}`} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
          <ArrowLeft size={13} />
          Back to Property
        </Link>
        <Link href={`/manager/properties/${propertyId}/units/new`} className={buttonVariants({ size: 'sm' })}>
          <Plus size={13} />
          Add Unit
        </Link>
      </PageHeader>

      <UnitsTable units={units} propertyId={propertyId} />
    </div>
  )
}
