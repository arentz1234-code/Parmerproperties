'use server'

import { revalidatePath } from 'next/cache'
import { Lease, LeaseStatus, UnitStatus } from '@/types'
import { leases } from '@/lib/mock-data/leases'
import { units } from '@/lib/mock-data/units'

function genId() {
  return 'lease_' + Date.now() + '_' + Math.random().toString(36).slice(2)
}

export interface LeaseFilters {
  status?: LeaseStatus
  tenantId?: string
  unitId?: string
}

export async function getLeases(
  filters?: LeaseFilters,
): Promise<{ success: true; data: Lease[] } | { success: false; error: string }> {
  try {
    let result = leases
    if (filters?.status) result = result.filter((l) => l.status === filters.status)
    if (filters?.tenantId) result = result.filter((l) => l.tenantId === filters.tenantId)
    if (filters?.unitId) result = result.filter((l) => l.unitId === filters.unitId)
    return { success: true, data: result }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

export async function getLeaseById(
  id: string,
): Promise<{ success: true; data: Lease } | { success: false; error: string }> {
  try {
    const lease = leases.find((l) => l.id === id)
    if (!lease) return { success: false, error: 'Lease not found' }
    return { success: true, data: lease }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

export async function createLease(
  data: Omit<Lease, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<{ success: true; data: Lease } | { success: false; error: string }> {
  try {
    const now = new Date()
    const newLease: Lease = {
      ...data,
      id: genId(),
      createdAt: now,
      updatedAt: now,
    }
    leases.push(newLease)

    // Update unit status to OCCUPIED when lease is ACTIVE
    if (data.status === LeaseStatus.ACTIVE) {
      const unitIdx = units.findIndex((u) => u.id === data.unitId)
      if (unitIdx !== -1) {
        units[unitIdx] = { ...units[unitIdx], status: UnitStatus.OCCUPIED, updatedAt: now }
      }
    }

    revalidatePath('/manager/leases')
    revalidatePath('/manager/tenants')
    revalidatePath('/manager/properties')
    return { success: true, data: newLease }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

export async function updateLease(
  id: string,
  data: Partial<Lease>,
): Promise<{ success: true; data: Lease } | { success: false; error: string }> {
  try {
    const idx = leases.findIndex((l) => l.id === id)
    if (idx === -1) return { success: false, error: 'Lease not found' }
    leases[idx] = { ...leases[idx], ...data, updatedAt: new Date() }
    revalidatePath('/manager/leases')
    revalidatePath(`/manager/leases/${id}`)
    return { success: true, data: leases[idx] }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

export async function terminateLease(
  id: string,
): Promise<{ success: true; data: Lease } | { success: false; error: string }> {
  try {
    const idx = leases.findIndex((l) => l.id === id)
    if (idx === -1) return { success: false, error: 'Lease not found' }

    const now = new Date()
    leases[idx] = {
      ...leases[idx],
      status: LeaseStatus.TERMINATED,
      updatedAt: now,
    }

    // Set unit to NOTICE
    const unitIdx = units.findIndex((u) => u.id === leases[idx].unitId)
    if (unitIdx !== -1) {
      units[unitIdx] = { ...units[unitIdx], status: UnitStatus.NOTICE, updatedAt: now }
    }

    revalidatePath('/manager/leases')
    revalidatePath('/manager/properties')
    return { success: true, data: leases[idx] }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

export async function renewLease(
  id: string,
  newEndDate: Date,
  newRentAmount: number,
): Promise<{ success: true; data: Lease } | { success: false; error: string }> {
  try {
    const existing = leases.find((l) => l.id === id)
    if (!existing) return { success: false, error: 'Lease not found' }

    const now = new Date()
    const renewedLease: Lease = {
      ...existing,
      id: genId(),
      startDate: existing.endDate,
      endDate: newEndDate,
      rentAmount: newRentAmount,
      status: LeaseStatus.ACTIVE,
      renewalStatus: 'RENEWED',
      signedAt: now,
      createdAt: now,
      updatedAt: now,
    }
    leases.push(renewedLease)

    revalidatePath('/manager/leases')
    revalidatePath('/manager/tenants')
    return { success: true, data: renewedLease }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}
