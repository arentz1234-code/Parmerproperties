'use server'

import { revalidatePath } from 'next/cache'
import { Owner, Property } from '@/types'
import { owners, propertyOwnerships } from '@/lib/mock-data/owners'
import { properties } from '@/lib/mock-data/properties'

function genId() {
  return 'owner_' + Date.now() + '_' + Math.random().toString(36).slice(2)
}

export type OwnerWithProperties = Owner & { properties: (Property & { ownershipShare: number })[] }

export async function getOwners(): Promise<{ success: true; data: OwnerWithProperties[] } | { success: false; error: string }> {
  try {
    const result: OwnerWithProperties[] = owners.map((owner) => {
      const ownerships = propertyOwnerships.filter((po) => po.ownerId === owner.id && !po.endDate)
      const ownerProperties = ownerships.map((po) => {
        const property = properties.find((p) => p.id === po.propertyId)!
        return { ...property, ownershipShare: po.ownershipShare }
      })
      return { ...owner, properties: ownerProperties }
    })
    return { success: true, data: result }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

export async function getOwnerById(
  id: string,
): Promise<{ success: true; data: OwnerWithProperties } | { success: false; error: string }> {
  try {
    const owner = owners.find((o) => o.id === id)
    if (!owner) return { success: false, error: 'Owner not found' }

    const ownerships = propertyOwnerships.filter((po) => po.ownerId === id && !po.endDate)
    const ownerProperties = ownerships.map((po) => {
      const property = properties.find((p) => p.id === po.propertyId)!
      return { ...property, ownershipShare: po.ownershipShare }
    })

    return { success: true, data: { ...owner, properties: ownerProperties } }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

export async function createOwner(
  data: Omit<Owner, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<{ success: true; data: Owner } | { success: false; error: string }> {
  try {
    const now = new Date()
    const newOwner: Owner = {
      ...data,
      id: genId(),
      createdAt: now,
      updatedAt: now,
    }
    owners.push(newOwner)
    revalidatePath('/manager/owners')
    return { success: true, data: newOwner }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

export async function updateOwner(
  id: string,
  data: Partial<Owner>,
): Promise<{ success: true; data: Owner } | { success: false; error: string }> {
  try {
    const idx = owners.findIndex((o) => o.id === id)
    if (idx === -1) return { success: false, error: 'Owner not found' }
    owners[idx] = { ...owners[idx], ...data, updatedAt: new Date() }
    revalidatePath('/manager/owners')
    revalidatePath(`/manager/owners/${id}`)
    return { success: true, data: owners[idx] }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}
