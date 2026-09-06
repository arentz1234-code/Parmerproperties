'use server'

import { revalidatePath } from 'next/cache'
import { Property, PropertyWithUnits } from '@/types'
import { properties } from '@/lib/mock-data/properties'
import { units } from '@/lib/mock-data/units'

function genId() {
  return 'prop_' + Date.now() + '_' + Math.random().toString(36).slice(2)
}

export async function getProperties(): Promise<{ success: true; data: Property[] } | { success: false; error: string }> {
  try {
    return { success: true, data: properties }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

export async function getPropertyById(id: string): Promise<{ success: true; data: PropertyWithUnits } | { success: false; error: string }> {
  try {
    const property = properties.find((p) => p.id === id)
    if (!property) return { success: false, error: 'Property not found' }
    const propertyUnits = units.filter((u) => u.propertyId === id)
    return { success: true, data: { ...property, units: propertyUnits } }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

export async function createProperty(
  data: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<{ success: true; data: Property } | { success: false; error: string }> {
  try {
    const now = new Date()
    const newProperty: Property = {
      ...data,
      id: genId(),
      createdAt: now,
      updatedAt: now,
    }
    properties.push(newProperty)
    revalidatePath('/manager/properties')
    return { success: true, data: newProperty }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

export async function updateProperty(
  id: string,
  data: Partial<Property>,
): Promise<{ success: true; data: Property } | { success: false; error: string }> {
  try {
    const idx = properties.findIndex((p) => p.id === id)
    if (idx === -1) return { success: false, error: 'Property not found' }
    properties[idx] = { ...properties[idx], ...data, updatedAt: new Date() }
    revalidatePath('/manager/properties')
    revalidatePath(`/manager/properties/${id}`)
    return { success: true, data: properties[idx] }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

export async function deleteProperty(
  id: string,
): Promise<{ success: true; data: { id: string } } | { success: false; error: string }> {
  try {
    const idx = properties.findIndex((p) => p.id === id)
    if (idx === -1) return { success: false, error: 'Property not found' }
    properties.splice(idx, 1)
    revalidatePath('/manager/properties')
    return { success: true, data: { id } }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}
