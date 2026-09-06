import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { MaintenanceRequestForm } from '@/components/maintenance/maintenance-request-form'
import { getVendors } from '@/lib/actions/vendor-actions'
import { units } from '@/lib/mock-data/units'
import { properties } from '@/lib/mock-data/properties'

export default async function NewMaintenanceRequestPage() {
  const vendorResult = await getVendors()
  const vendors = vendorResult.success ? vendorResult.data : []

  // Build unit options with property labels
  const unitOptions = units.map((u) => {
    const property = properties.find((p) => p.id === u.propertyId)
    return {
      id: u.id,
      label: `Unit ${u.unitNumber}`,
      propertyName: property?.name ?? '',
    }
  })

  return (
    <div>
      <PageHeader title="New Maintenance Request">
        <Link href="/manager/maintenance">
          <Button variant="outline">
            <ArrowLeft className="size-4" />
            Back
          </Button>
        </Link>
      </PageHeader>

      <div className="max-w-2xl">
        <MaintenanceRequestForm units={unitOptions} vendors={vendors} />
      </div>
    </div>
  )
}
