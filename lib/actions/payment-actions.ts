'use server'

import { revalidatePath } from 'next/cache'
import { Payment, PaymentStatus, PaymentMethod, LeaseStatus } from '@/types'
import { payments } from '@/lib/mock-data/payments'
import { leases } from '@/lib/mock-data/leases'
import { units } from '@/lib/mock-data/units'
import { properties } from '@/lib/mock-data/properties'
import { tenants } from '@/lib/mock-data/tenants'
import type { RentRollRow } from '@/lib/mock-data/index'

function genId() {
  return 'pay_' + Date.now() + '_' + Math.random().toString(36).slice(2)
}

export interface PaymentFilters {
  leaseId?: string
  tenantId?: string
  status?: PaymentStatus
  month?: number
  year?: number
}

export async function getPayments(
  filters?: PaymentFilters,
): Promise<{ success: true; data: Payment[] } | { success: false; error: string }> {
  try {
    let result = payments
    if (filters?.leaseId) result = result.filter((p) => p.leaseId === filters.leaseId)
    if (filters?.tenantId) result = result.filter((p) => p.tenantId === filters.tenantId)
    if (filters?.status) result = result.filter((p) => p.status === filters.status)
    if (filters?.year !== undefined) result = result.filter((p) => p.dueDate.getFullYear() === filters.year)
    if (filters?.month !== undefined) result = result.filter((p) => p.dueDate.getMonth() === filters.month)
    return { success: true, data: result }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

export async function getRentRoll(): Promise<{ success: true; data: RentRollRow[] } | { success: false; error: string }> {
  try {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()

    const rows: RentRollRow[] = units
      .filter((u) => u.bedrooms > 0)
      .map((unit) => {
        const property = properties.find((p) => p.id === unit.propertyId)!

        const activeLease =
          leases.find((l) => l.unitId === unit.id && l.status === LeaseStatus.ACTIVE) ?? null

        const tenant = activeLease
          ? (tenants.find((t) => t.id === activeLease.tenantId) ?? null)
          : null

        const currentPayment = activeLease
          ? (payments.find(
              (p) =>
                p.leaseId === activeLease.id &&
                p.dueDate.getFullYear() === currentYear &&
                p.dueDate.getMonth() === currentMonth,
            ) ?? null)
          : null

        const balance = currentPayment
          ? currentPayment.amountDue - currentPayment.amount
          : activeLease
          ? activeLease.rentAmount
          : 0

        return { unit, property, tenant, lease: activeLease, currentPayment, balance }
      })

    return { success: true, data: rows }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

export async function recordPayment(data: {
  leaseId: string
  tenantId: string
  amount: number
  method: PaymentMethod
  notes?: string
}): Promise<{ success: true; data: Payment } | { success: false; error: string }> {
  try {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()

    // Find existing PENDING payment for this lease this month and mark it PAID
    const pendingIdx = payments.findIndex(
      (p) =>
        p.leaseId === data.leaseId &&
        p.status === PaymentStatus.PENDING &&
        p.dueDate.getFullYear() === currentYear &&
        p.dueDate.getMonth() === currentMonth,
    )

    if (pendingIdx !== -1) {
      const existing = payments[pendingIdx]
      const status =
        data.amount >= existing.amountDue ? PaymentStatus.PAID : PaymentStatus.PARTIAL
      payments[pendingIdx] = {
        ...existing,
        amount: data.amount,
        status,
        method: data.method,
        paidAt: now,
        notes: data.notes,
        updatedAt: now,
      }
      revalidatePath('/manager/payments')
      revalidatePath('/manager/rent-roll')
      return { success: true, data: payments[pendingIdx] }
    }

    // Otherwise create a new payment record
    const lease = leases.find((l) => l.id === data.leaseId)
    const amountDue = lease ? lease.rentAmount : data.amount
    const newPayment: Payment = {
      id: genId(),
      leaseId: data.leaseId,
      tenantId: data.tenantId,
      amount: data.amount,
      amountDue,
      status: data.amount >= amountDue ? PaymentStatus.PAID : PaymentStatus.PARTIAL,
      method: data.method,
      dueDate: new Date(currentYear, currentMonth, 1),
      paidAt: now,
      notes: data.notes,
      createdAt: now,
      updatedAt: now,
    }
    payments.push(newPayment)
    revalidatePath('/manager/payments')
    revalidatePath('/manager/rent-roll')
    return { success: true, data: newPayment }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

export async function generateMonthlyCharges(): Promise<{ success: true; data: Payment[] } | { success: false; error: string }> {
  try {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()
    const dueDate = new Date(currentYear, currentMonth, 1)

    const activeLeases = leases.filter((l) => l.status === LeaseStatus.ACTIVE)
    const created: Payment[] = []

    for (const lease of activeLeases) {
      // Idempotent: skip if a payment already exists for this lease this month
      const exists = payments.some(
        (p) =>
          p.leaseId === lease.id &&
          p.dueDate.getFullYear() === currentYear &&
          p.dueDate.getMonth() === currentMonth,
      )
      if (exists) continue

      const newPayment: Payment = {
        id: genId(),
        leaseId: lease.id,
        tenantId: lease.tenantId,
        amount: 0,
        amountDue: lease.rentAmount,
        status: PaymentStatus.PENDING,
        dueDate,
        createdAt: now,
        updatedAt: now,
      }
      payments.push(newPayment)
      created.push(newPayment)
    }

    revalidatePath('/manager/payments')
    revalidatePath('/manager/rent-roll')
    return { success: true, data: created }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

export async function getPaymentsByTenant(
  tenantId: string,
): Promise<{ success: true; data: Payment[] } | { success: false; error: string }> {
  try {
    const result = payments.filter((p) => p.tenantId === tenantId)
    return { success: true, data: result }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}
