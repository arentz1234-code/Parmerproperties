'use server'

import { revalidatePath } from 'next/cache'
import { Vendor } from '@/types'
import { vendors } from '@/lib/mock-data/vendors'

function genId() {
  return 'vendor_' + Date.now() + '_' + Math.random().toString(36).slice(2)
}

export async function getVendors(
  trade?: string,
): Promise<{ success: true; data: Vendor[] } | { success: false; error: string }> {
  try {
    const result = trade
      ? vendors.filter((v) => v.trade.toLowerCase() === trade.toLowerCase())
      : vendors
    return { success: true, data: result }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

export async function getVendorById(
  id: string,
): Promise<{ success: true; data: Vendor } | { success: false; error: string }> {
  try {
    const vendor = vendors.find((v) => v.id === id)
    if (!vendor) return { success: false, error: 'Vendor not found' }
    return { success: true, data: vendor }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

export async function createVendor(
  data: Omit<Vendor, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<{ success: true; data: Vendor } | { success: false; error: string }> {
  try {
    const now = new Date()
    const newVendor: Vendor = {
      ...data,
      id: genId(),
      createdAt: now,
      updatedAt: now,
    }
    vendors.push(newVendor)
    revalidatePath('/manager/vendors')
    return { success: true, data: newVendor }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

export async function updateVendor(
  id: string,
  data: Partial<Vendor>,
): Promise<{ success: true; data: Vendor } | { success: false; error: string }> {
  try {
    const idx = vendors.findIndex((v) => v.id === id)
    if (idx === -1) return { success: false, error: 'Vendor not found' }
    vendors[idx] = { ...vendors[idx], ...data, updatedAt: new Date() }
    revalidatePath('/manager/vendors')
    revalidatePath(`/manager/vendors/${id}`)
    return { success: true, data: vendors[idx] }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

export async function deleteVendor(
  id: string,
): Promise<{ success: true; data: { id: string } } | { success: false; error: string }> {
  try {
    const idx = vendors.findIndex((v) => v.id === id)
    if (idx === -1) return { success: false, error: 'Vendor not found' }
    vendors.splice(idx, 1)
    revalidatePath('/manager/vendors')
    return { success: true, data: { id } }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}
