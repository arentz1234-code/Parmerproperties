import Link from 'next/link'
import { FilePlus } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { buttonVariants } from '@/components/ui/button'
import { LeaseTable } from '@/components/leases/lease-table'
import { getLeases } from '@/lib/actions/lease-actions'
import { units } from '@/lib/mock-data/units'
import { properties } from '@/lib/mock-data/properties'
import { tenants } from '@/lib/mock-data/tenants'
import { getDaysUntil } from '@/lib/utils'

export default async function LeasesPage() {
  const result = await getLeases()
  const leases = result.success ? result.data : []

  const rows = leases.map((lease) => {
    const unit = units.find((u) => u.id === lease.unitId)
    const property = unit ? properties.find((p) => p.id === unit.propertyId) : undefined
    const tenant = tenants.find((t) => t.id === lease.tenantId)

    return {
      id: lease.id,
      tenantName: tenant ? `${tenant.firstName} ${tenant.lastName}` : 'Unknown',
      propertyUnit: property && unit ? `${property.name} — Unit ${unit.unitNumber}` : 'Unknown',
      startDate: lease.startDate,
      endDate: lease.endDate,
      rentAmount: lease.rentAmount,
      status: lease.status,
      daysRemaining: getDaysUntil(lease.endDate),
      unitId: lease.unitId,
      tenantId: lease.tenantId,
    }
  })

  return (
    <div>
      <PageHeader title="Leases" description={`${leases.length} total lease records`}>
        <Link href="/manager/leases/new" className={buttonVariants({})}>
          <FilePlus size={15} />
          New Lease
        </Link>
      </PageHeader>

      <LeaseTable rows={rows} />
    </div>
  )
}
