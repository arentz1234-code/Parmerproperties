'use server'

import { revalidatePath } from 'next/cache'
import { MaintenanceRequest, MaintenanceStatus, MaintenancePriority } from '@/types'
import { maintenanceRequests } from '@/lib/mock-data/maintenance'
import { vendors } from '@/lib/mock-data/vendors'

function genId() {
  return 'maint_' + Date.now() + '_' + Math.random().toString(36).slice(2)
}

export interface MaintenanceFilters {
  status?: MaintenanceStatus
  priority?: MaintenancePriority
  propertyId?: string
}

export async function getMaintenanceRequests(
  filters?: MaintenanceFilters,
): Promise<{ success: true; data: MaintenanceRequest[] } | { success: false; error: string }> {
  try {
    let result = maintenanceRequests
    if (filters?.status) result = result.filter((m) => m.status === filters.status)
    if (filters?.priority) result = result.filter((m) => m.priority === filters.priority)
    // propertyId filtering requires cross-reference with units — filter by unitId prefix convention
    // Units are named unit_<propId>_... so we match by unitId containing propertyId
    if (filters?.propertyId) {
      result = result.filter((m) => m.unitId.includes(filters.propertyId!.replace('prop_', '')))
    }
    return { success: true, data: result }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

export async function getMaintenanceById(
  id: string,
): Promise<{ success: true; data: MaintenanceRequest & { vendor?: (typeof vendors)[0] } } | { success: false; error: string }> {
  try {
    const request = maintenanceRequests.find((m) => m.id === id)
    if (!request) return { success: false, error: 'Maintenance request not found' }
    const vendor = request.vendorId ? vendors.find((v) => v.id === request.vendorId) : undefined
    return { success: true, data: { ...request, vendor } }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

export async function createMaintenanceRequest(
  data: Omit<MaintenanceRequest, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<{ success: true; data: MaintenanceRequest } | { success: false; error: string }> {
  try {
    const now = new Date()
    const newRequest: MaintenanceRequest = {
      ...data,
      id: genId(),
      createdAt: now,
      updatedAt: now,
    }
    maintenanceRequests.push(newRequest)
    revalidatePath('/manager/maintenance')
    return { success: true, data: newRequest }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

export async function updateMaintenanceRequest(
  id: string,
  data: Partial<MaintenanceRequest>,
): Promise<{ success: true; data: MaintenanceRequest } | { success: false; error: string }> {
  try {
    const idx = maintenanceRequests.findIndex((m) => m.id === id)
    if (idx === -1) return { success: false, error: 'Maintenance request not found' }
    maintenanceRequests[idx] = { ...maintenanceRequests[idx], ...data, updatedAt: new Date() }
    revalidatePath('/manager/maintenance')
    revalidatePath(`/manager/maintenance/${id}`)
    return { success: true, data: maintenanceRequests[idx] }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

export async function assignVendor(
  requestId: string,
  vendorId: string,
  scheduledAt?: Date,
): Promise<{ success: true; data: MaintenanceRequest } | { success: false; error: string }> {
  try {
    const idx = maintenanceRequests.findIndex((m) => m.id === requestId)
    if (idx === -1) return { success: false, error: 'Maintenance request not found' }
    const vendor = vendors.find((v) => v.id === vendorId)
    if (!vendor) return { success: false, error: 'Vendor not found' }

    maintenanceRequests[idx] = {
      ...maintenanceRequests[idx],
      vendorId,
      scheduledAt: scheduledAt ?? maintenanceRequests[idx].scheduledAt,
      status: MaintenanceStatus.IN_PROGRESS,
      updatedAt: new Date(),
    }
    revalidatePath('/manager/maintenance')
    revalidatePath(`/manager/maintenance/${requestId}`)
    return { success: true, data: maintenanceRequests[idx] }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

export async function resolveRequest(
  id: string,
  actualCost: number,
  notes: string,
): Promise<{ success: true; data: MaintenanceRequest } | { success: false; error: string }> {
  try {
    const idx = maintenanceRequests.findIndex((m) => m.id === id)
    if (idx === -1) return { success: false, error: 'Maintenance request not found' }

    const now = new Date()
    maintenanceRequests[idx] = {
      ...maintenanceRequests[idx],
      status: MaintenanceStatus.COMPLETED,
      actualCost,
      notes,
      completedAt: now,
      updatedAt: now,
    }
    revalidatePath('/manager/maintenance')
    revalidatePath(`/manager/maintenance/${id}`)
    return { success: true, data: maintenanceRequests[idx] }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

export async function cancelRequest(
  id: string,
): Promise<{ success: true; data: MaintenanceRequest } | { success: false; error: string }> {
  try {
    const idx = maintenanceRequests.findIndex((m) => m.id === id)
    if (idx === -1) return { success: false, error: 'Maintenance request not found' }

    maintenanceRequests[idx] = {
      ...maintenanceRequests[idx],
      status: MaintenanceStatus.CANCELLED,
      updatedAt: new Date(),
    }
    revalidatePath('/manager/maintenance')
    revalidatePath(`/manager/maintenance/${id}`)
    return { success: true, data: maintenanceRequests[idx] }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}
