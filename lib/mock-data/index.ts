import {
  DashboardKPIs,
  Property,
  PropertyWithUnits,
  Tenant,
  TenantWithLease,
  Unit,
  Lease,
  Payment,
  PaymentStatus,
  UnitStatus,
  LeaseStatus,
} from '@/types'

// ─── Re-exports ───────────────────────────────────────────────────────────────
export { users } from './users'
export { properties } from './properties'
export { units } from './units'
export { tenants } from './tenants'
export { leases } from './leases'
export { payments } from './payments'
export { maintenanceRequests } from './maintenance'
export { vendors } from './vendors'
export { owners, propertyOwnerships } from './owners'
export { messages } from './messages'
export { applications } from './applications'
export { leads } from './leads'
export { tasks } from './tasks'
export { inspections } from './inspections'
export { documents } from './documents'

// ─── Lazy imports (avoid circular refs) ──────────────────────────────────────
import { properties } from './properties'
import { units } from './units'
import { tenants } from './tenants'
import { leases } from './leases'
import { payments } from './payments'
import { maintenanceRequests } from './maintenance'
import { applications } from './applications'

// ─── Helper types ─────────────────────────────────────────────────────────────

export interface RentRollRow {
  unit: Unit
  property: Property
  tenant: Tenant | null
  lease: Lease | null
  currentPayment: Payment | null
  balance: number
}

export interface ActivityItem {
  id: string
  type:
    | 'payment_received'
    | 'payment_overdue'
    | 'maintenance_submitted'
    | 'maintenance_completed'
    | 'lease_signed'
    | 'application_submitted'
    | 'inspection_completed'
  description: string
  entityId: string
  createdAt: Date
}

// ─── getDashboardKPIs ─────────────────────────────────────────────────────────

export function getDashboardKPIs(): DashboardKPIs {
  const totalUnits = units.length
  const occupiedUnits = units.filter((u) => u.status === UnitStatus.OCCUPIED).length
  const vacantUnits = units.filter((u) => u.status === UnitStatus.VACANT).length
  const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0

  const currentMonth = new Date('2026-09-01')
  const currentMonthPayments = payments.filter(
    (p) =>
      p.dueDate.getFullYear() === currentMonth.getFullYear() &&
      p.dueDate.getMonth() === currentMonth.getMonth(),
  )

  const rentCollectedThisMonth = currentMonthPayments
    .filter((p) => p.status === PaymentStatus.PAID || p.status === PaymentStatus.PARTIAL)
    .reduce((sum, p) => sum + p.amount, 0)

  const overduePayments = currentMonthPayments.filter(
    (p) => p.status === PaymentStatus.OVERDUE,
  ).length

  const openMaintenanceRequests = maintenanceRequests.filter(
    (m) => m.status === 'OPEN' || m.status === 'IN_PROGRESS',
  ).length

  const pendingApplications = applications.filter((a) => a.status === 'PENDING').length

  const activeLeases = leases.filter((l) => l.status === LeaseStatus.ACTIVE).length

  return {
    totalUnits,
    occupiedUnits,
    vacantUnits,
    occupancyRate,
    rentCollectedThisMonth,
    overduePayments,
    openMaintenanceRequests,
    pendingApplications,
    totalProperties: properties.length,
    activeLeases,
  }
}

// ─── getPropertyWithUnits ─────────────────────────────────────────────────────

export function getPropertyWithUnits(propertyId: string): PropertyWithUnits | undefined {
  const property = properties.find((p) => p.id === propertyId)
  if (!property) return undefined

  const propertyUnits = units.filter((u) => u.propertyId === propertyId)

  return {
    ...property,
    units: propertyUnits,
  }
}

// ─── getTenantWithLease ───────────────────────────────────────────────────────

export function getTenantWithLease(tenantId: string): TenantWithLease | undefined {
  const tenant = tenants.find((t) => t.id === tenantId)
  if (!tenant) return undefined

  const activeLease = leases.find(
    (l) => l.tenantId === tenantId && l.status === LeaseStatus.ACTIVE,
  )

  if (!activeLease) {
    return { ...tenant, lease: undefined }
  }

  const unit = units.find((u) => u.id === activeLease.unitId)
  if (!unit) return { ...tenant, lease: undefined }

  const property = properties.find((p) => p.id === unit.propertyId)
  if (!property) return { ...tenant, lease: undefined }

  return {
    ...tenant,
    lease: {
      ...activeLease,
      unit: {
        ...unit,
        property,
      },
    },
  }
}

// ─── getRentRoll ──────────────────────────────────────────────────────────────

export function getRentRoll(): RentRollRow[] {
  const currentMonth = new Date('2026-09-01')

  return units
    .filter((u) => u.bedrooms > 0) // exclude commercial units from rent roll
    .map((unit) => {
      const property = properties.find((p) => p.id === unit.propertyId)!

      const activeLease = leases.find(
        (l) => l.unitId === unit.id && l.status === LeaseStatus.ACTIVE,
      ) ?? null

      const tenant = activeLease
        ? (tenants.find((t) => t.id === activeLease.tenantId) ?? null)
        : null

      const currentPayment = activeLease
        ? (payments.find(
            (p) =>
              p.leaseId === activeLease.id &&
              p.dueDate.getFullYear() === currentMonth.getFullYear() &&
              p.dueDate.getMonth() === currentMonth.getMonth(),
          ) ?? null)
        : null

      const balance = currentPayment
        ? currentPayment.amountDue - currentPayment.amount
        : (activeLease ? activeLease.rentAmount : 0)

      return { unit, property, tenant, lease: activeLease, currentPayment, balance }
    })
}

// ─── getOverduePayments ───────────────────────────────────────────────────────

export function getOverduePayments(): Payment[] {
  return payments.filter((p) => p.status === PaymentStatus.OVERDUE)
}

// ─── getRecentActivity ────────────────────────────────────────────────────────

export function getRecentActivity(): ActivityItem[] {
  const items: ActivityItem[] = []

  // Payments received (Sep 2026)
  payments
    .filter((p) => p.status === PaymentStatus.PAID && p.paidAt)
    .forEach((p) => {
      const tenant = tenants.find((t) => t.id === p.tenantId)
      const tenantName = tenant ? `${tenant.firstName} ${tenant.lastName}` : 'Unknown tenant'
      items.push({
        id: `act_pay_${p.id}`,
        type: 'payment_received',
        description: `Rent payment of $${p.amount.toLocaleString()} received from ${tenantName}`,
        entityId: p.id,
        createdAt: p.paidAt!,
      })
    })

  // Overdue payments
  payments
    .filter((p) => p.status === PaymentStatus.OVERDUE)
    .forEach((p) => {
      const tenant = tenants.find((t) => t.id === p.tenantId)
      const tenantName = tenant ? `${tenant.firstName} ${tenant.lastName}` : 'Unknown tenant'
      items.push({
        id: `act_ovd_${p.id}`,
        type: 'payment_overdue',
        description: `Payment overdue — $${p.amountDue.toLocaleString()} from ${tenantName}`,
        entityId: p.id,
        createdAt: p.updatedAt,
      })
    })

  // Maintenance submitted
  maintenanceRequests.forEach((m) => {
    items.push({
      id: `act_maint_sub_${m.id}`,
      type: 'maintenance_submitted',
      description: `Maintenance request: "${m.title}"`,
      entityId: m.id,
      createdAt: m.createdAt,
    })
  })

  // Maintenance completed
  maintenanceRequests
    .filter((m) => m.status === 'COMPLETED' && m.completedAt)
    .forEach((m) => {
      items.push({
        id: `act_maint_done_${m.id}`,
        type: 'maintenance_completed',
        description: `Maintenance completed: "${m.title}"`,
        entityId: m.id,
        createdAt: m.completedAt!,
      })
    })

  // Leases signed
  leases
    .filter((l) => l.signedAt)
    .forEach((l) => {
      const tenant = tenants.find((t) => t.id === l.tenantId)
      const tenantName = tenant ? `${tenant.firstName} ${tenant.lastName}` : 'Unknown tenant'
      const unit = units.find((u) => u.id === l.unitId)
      const unitNum = unit ? unit.unitNumber : l.unitId
      items.push({
        id: `act_lease_${l.id}`,
        type: 'lease_signed',
        description: `Lease signed by ${tenantName} — Unit ${unitNum}`,
        entityId: l.id,
        createdAt: l.signedAt!,
      })
    })

  // Applications submitted
  applications.forEach((a) => {
    items.push({
      id: `act_app_${a.id}`,
      type: 'application_submitted',
      description: `Application submitted by ${a.applicantName}`,
      entityId: a.id,
      createdAt: a.submittedAt,
    })
  })

  // Sort by date descending and return last 10
  return items
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 10)
}

// ─── getOccupancyByProperty ───────────────────────────────────────────────────

export function getOccupancyByProperty(): {
  propertyId: string
  name: string
  total: number
  occupied: number
  rate: number
}[] {
  return properties.map((property) => {
    const propertyUnits = units.filter(
      (u) => u.propertyId === property.id && u.bedrooms > 0, // residential only
    )
    const total = propertyUnits.length
    const occupied = propertyUnits.filter((u) => u.status === UnitStatus.OCCUPIED).length
    const rate = total > 0 ? Math.round((occupied / total) * 100) : 0

    return {
      propertyId: property.id,
      name: property.name,
      total,
      occupied,
      rate,
    }
  })
}

// ─── getRevenueByMonth ────────────────────────────────────────────────────────

export function getRevenueByMonth(months = 3): {
  month: string
  expected: number
  collected: number
}[] {
  // Build a map from (year-month) -> { expected, collected }
  const monthMap = new Map<string, { expected: number; collected: number }>()

  // Get all unique months represented in payments
  const allMonths = payments.map((p) => {
    const y = p.dueDate.getFullYear()
    const m = p.dueDate.getMonth()
    return `${y}-${String(m + 1).padStart(2, '0')}`
  })
  const uniqueMonths = [...new Set(allMonths)]
    .sort()
    .slice(-months) // keep only the last N months

  uniqueMonths.forEach((key) => {
    monthMap.set(key, { expected: 0, collected: 0 })
  })

  payments.forEach((p) => {
    const y = p.dueDate.getFullYear()
    const m = p.dueDate.getMonth()
    const key = `${y}-${String(m + 1).padStart(2, '0')}`

    if (!monthMap.has(key)) return

    const entry = monthMap.get(key)!
    entry.expected += p.amountDue
    if (p.status === PaymentStatus.PAID || p.status === PaymentStatus.PARTIAL) {
      entry.collected += p.amount
    }
    monthMap.set(key, entry)
  })

  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ]

  return Array.from(monthMap.entries()).map(([key, val]) => {
    const [year, monthStr] = key.split('-')
    const monthIdx = parseInt(monthStr, 10) - 1
    const label = `${monthNames[monthIdx]} ${year}`
    return { month: label, expected: val.expected, collected: val.collected }
  })
}
