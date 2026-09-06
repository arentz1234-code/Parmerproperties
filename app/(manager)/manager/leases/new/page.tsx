import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { buttonVariants } from '@/components/ui/button'
import { LeaseForm } from '@/components/leases/lease-form'
import { units } from '@/lib/mock-data/units'
import { properties } from '@/lib/mock-data/properties'
import { tenants } from '@/lib/mock-data/tenants'
import { UnitStatus } from '@/types'

export default function NewLeasePage() {
  const vacantUnits = units
    .filter((u) => u.status === UnitStatus.VACANT && u.bedrooms > 0)
    .map((unit) => ({
      ...unit,
      property: properties.find((p) => p.id === unit.propertyId)!,
    }))
    .filter((u) => u.property)

  return (
    <div>
      <PageHeader title="New Lease" description="Create a new lease agreement.">
        <Link href="/manager/leases" className={buttonVariants({ variant: 'outline' })}>
          <ArrowLeft size={14} />
          Back to Leases
        </Link>
      </PageHeader>

      <LeaseForm vacantUnits={vacantUnits} tenants={tenants} />
    </div>
  )
}
