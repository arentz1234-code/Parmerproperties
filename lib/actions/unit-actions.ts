'use server'

import { revalidatePath } from 'next/cache'
import { Unit, UnitStatus } from '@/types'
import { units } from '@/lib/mock-data/units'

function genId() {
  return 'unit_' + Date.now() + '_' + Math.random().toString(36).slice(2)
}

export async function getUnits(
  propertyId?: string,
): Promise<{ success: true; data: Unit[] } | { success: false; error: string }> {
  try {
    const result = propertyId ? units.filter((u) => u.propertyId === propertyId) : units
    return { success: true, data: result }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

export async function getUnitById(
  id: string,
): Promise<{ success: true; data: Unit } | { success: false; error: string }> {
  try {
    const unit = units.find((u) => u.id === id)
    if (!unit) return { success: false, error: 'Unit not found' }
    return { success: true, data: unit }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

export async function createUnit(
  data: Omit<Unit, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<{ success: true; data: Unit } | { success: false; error: string }> {
  try {
    const now = new Date()
    const newUnit: Unit = {
      ...data,
      id: genId(),
      createdAt: now,
      updatedAt: now,
    }
    units.push(newUnit)
    revalidatePath('/manager/properties')
    revalidatePath(`/manager/properties/${data.propertyId}`)
    return { success: true, data: newUnit }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

export async function updateUnit(
  id: string,
  data: Partial<Unit>,
): Promise<{ success: true; data: Unit } | { success: false; error: string }> {
  try {
    const idx = units.findIndex((u) => u.id === id)
    if (idx === -1) return { success: false, error: 'Unit not found' }
    units[idx] = { ...units[idx], ...data, updatedAt: new Date() }
    revalidatePath('/manager/properties')
    revalidatePath(`/manager/properties/${units[idx].propertyId}`)
    return { success: true, data: units[idx] }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

export async function deleteUnit(
  id: string,
): Promise<{ success: true; data: { id: string } } | { success: false; error: string }> {
  try {
    const idx = units.findIndex((u) => u.id === id)
    if (idx === -1) return { success: false, error: 'Unit not found' }
    const propertyId = units[idx].propertyId
    units.splice(idx, 1)
    revalidatePath('/manager/properties')
    revalidatePath(`/manager/properties/${propertyId}`)
    return { success: true, data: { id } }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

export async function updateUnitStatus(
  id: string,
  status: UnitStatus,
): Promise<{ success: true; data: Unit } | { success: false; error: string }> {
  try {
    const idx = units.findIndex((u) => u.id === id)
    if (idx === -1) return { success: false, error: 'Unit not found' }
    units[idx] = { ...units[idx], status, updatedAt: new Date() }
    revalidatePath('/manager/properties')
    revalidatePath(`/manager/properties/${units[idx].propertyId}`)
    return { success: true, data: units[idx] }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}
