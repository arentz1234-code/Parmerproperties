import Link from 'next/link'
import { UserPlus } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { buttonVariants } from '@/components/ui/button'
import { TenantTable } from '@/components/tenants/tenant-table'
import { getTenants } from '@/lib/actions/tenant-actions'
import { getLeases, getLeaseById } from '@/lib/actions/lease-actions'
import { leases } from '@/lib/mock-data/leases'
import { units } from '@/lib/mock-data/units'
import { properties } from '@/lib/mock-data/properties'
import { LeaseStatus } from '@/types'

export default async function TenantsPage() {
  const [tenantsResult, leasesResult] = await Promise.all([
    getTenants(),
    getLeases(),
  ])

  const tenants = tenantsResult.success ? tenantsResult.data : []
  const allLeases = leasesResult.success ? leasesResult.data : []

  // Build enriched rows
  const rows = tenants.map((tenant) => {
    const activeLease = allLeases.find(
      (l) => l.tenantId === tenant.id && l.status === LeaseStatus.ACTIVE,
    )
    const unit = activeLease ? units.find((u) => u.id === activeLease.unitId) : undefined
    const property = unit ? properties.find((p) => p.id === unit.propertyId) : undefined

    return {
      id: tenant.id,
      firstName: tenant.firstName,
      lastName: tenant.lastName,
      email: tenant.email,
      phone: tenant.phone,
      unitLabel: unit ? `${property?.name ?? ''} - Unit ${unit.unitNumber}` : undefined,
      leaseStatus: activeLease?.status ?? undefined,
      moveInDate: activeLease?.startDate ?? undefined,
      createdAt: tenant.createdAt,
      updatedAt: tenant.updatedAt,
    }
  })

  return (
    <div>
      <PageHeader title="Tenants" description={`${tenants.length} total tenants`}>
        <Link href="/manager/tenants/new" className={buttonVariants({})}>
          <UserPlus size={15} />
          Add Tenant
        </Link>
      </PageHeader>

      <TenantTable rows={rows} />
    </div>
  )
}
