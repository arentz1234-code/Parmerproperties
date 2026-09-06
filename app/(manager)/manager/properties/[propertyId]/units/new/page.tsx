import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/page-header'
import { UnitForm } from '@/components/properties/unit-form'
import { getPropertyWithUnits } from '@/lib/mock-data'

interface Props {
  params: Promise<{ propertyId: string }>
}

export default async function NewUnitPage({ params }: Props) {
  const { propertyId } = await params

  let property
  try {
    const result = getPropertyWithUnits(propertyId)
    if (result) property = result
  } catch (e) {
    console.error('Failed to load property:', e)
  }

  if (!property) notFound()

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <PageHeader
        title="Add Unit"
        description={`Add a new unit to ${property.name}`}
      >
        <Link href={`/manager/properties/${propertyId}`} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
          <ArrowLeft size={13} />
          Back
        </Link>
      </PageHeader>
      <UnitForm propertyId={propertyId} />
    </div>
  )
}
