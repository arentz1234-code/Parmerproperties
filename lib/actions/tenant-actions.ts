'use server'

import { revalidatePath } from 'next/cache'
import { Tenant, TenantWithLease, LeaseStatus } from '@/types'
import { tenants } from '@/lib/mock-data/tenants'
import { leases } from '@/lib/mock-data/leases'
import { units } from '@/lib/mock-data/units'
import { properties } from '@/lib/mock-data/properties'

function genId() {
  return 'tenant_' + Date.now() + '_' + Math.random().toString(36).slice(2)
}

export async function getTenants(): Promise<{ success: true; data: Tenant[] } | { success: false; error: string }> {
  try {
    return { success: true, data: tenants }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

export async function getTenantById(
  id: string,
): Promise<{ success: true; data: TenantWithLease } | { success: false; error: string }> {
  try {
    const tenant = tenants.find((t) => t.id === id)
    if (!tenant) return { success: false, error: 'Tenant not found' }

    const activeLease = leases.find(
      (l) => l.tenantId === id && l.status === LeaseStatus.ACTIVE,
    )

    if (!activeLease) return { success: true, data: { ...tenant, lease: undefined } }

    const unit = units.find((u) => u.id === activeLease.unitId)
    if (!unit) return { success: true, data: { ...tenant, lease: undefined } }

    const property = properties.find((p) => p.id === unit.propertyId)
    if (!property) return { success: true, data: { ...tenant, lease: undefined } }

    return {
      success: true,
      data: {
        ...tenant,
        lease: { ...activeLease, unit: { ...unit, property } },
      },
    }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

export async function createTenant(
  data: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<{ success: true; data: Tenant } | { success: false; error: string }> {
  try {
    const now = new Date()
    const newTenant: Tenant = {
      ...data,
      id: genId(),
      createdAt: now,
      updatedAt: now,
    }
    tenants.push(newTenant)
    revalidatePath('/manager/tenants')
    return { success: true, data: newTenant }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

export async function updateTenant(
  id: string,
  data: Partial<Tenant>,
): Promise<{ success: true; data: Tenant } | { success: false; error: string }> {
  try {
    const idx = tenants.findIndex((t) => t.id === id)
    if (idx === -1) return { success: false, error: 'Tenant not found' }
    tenants[idx] = { ...tenants[idx], ...data, updatedAt: new Date() }
    revalidatePath('/manager/tenants')
    revalidatePath(`/manager/tenants/${id}`)
    return { success: true, data: tenants[idx] }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

export async function deleteTenant(
  id: string,
): Promise<{ success: true; data: { id: string } } | { success: false; error: string }> {
  try {
    const idx = tenants.findIndex((t) => t.id === id)
    if (idx === -1) return { success: false, error: 'Tenant not found' }
    tenants.splice(idx, 1)
    revalidatePath('/manager/tenants')
    return { success: true, data: { id } }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}
