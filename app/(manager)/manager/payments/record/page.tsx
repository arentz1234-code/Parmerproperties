import { PageHeader } from '@/components/shared/page-header'
import { RecordPaymentForm, type LeaseOption } from '@/components/payments/record-payment-form'
import { getLeases } from '@/lib/actions/lease-actions'
import { getTenants } from '@/lib/actions/tenant-actions'
import { getUnits } from '@/lib/actions/unit-actions'
import { getProperties } from '@/lib/actions/property-actions'
import { LeaseStatus } from '@/types'

export default async function RecordPaymentPage() {
  const [leasesResult, tenantsResult, unitsResult, propertiesResult] = await Promise.all([
    getLeases({ status: LeaseStatus.ACTIVE }),
    getTenants(),
    getUnits(),
    getProperties(),
  ])

  const leases = leasesResult.success ? leasesResult.data : []
  const tenants = tenantsResult.success ? tenantsResult.data : []
  const units = unitsResult.success ? unitsResult.data : []
  const properties = propertiesResult.success ? propertiesResult.data : []

  const leaseOptions: LeaseOption[] = leases
    .map((lease) => {
      const tenant = tenants.find((t) => t.id === lease.tenantId)
      const unit = units.find((u) => u.id === lease.unitId)
      const property = unit ? properties.find((p) => p.id === unit.propertyId) : undefined

      if (!tenant || !unit) return null

      return {
        leaseId: lease.id,
        tenantId: lease.tenantId,
        tenantName: `${tenant.firstName} ${tenant.lastName}`,
        propertyUnit: `${property?.name ?? 'Property'} — Unit ${unit.unitNumber}`,
        rentAmount: lease.rentAmount,
      }
    })
    .filter((o): o is LeaseOption => o !== null)

  return (
    <div>
      <PageHeader
        title="Record Payment"
        description="Manually record a rent payment for a tenant"
      />
      <RecordPaymentForm leases={leaseOptions} />
    </div>
  )
}
