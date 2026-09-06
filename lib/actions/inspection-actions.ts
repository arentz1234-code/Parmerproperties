'use server'

import { revalidatePath } from 'next/cache'
import { Inspection, InspectionStatus, InspectionType } from '@/types'
import { inspections } from '@/lib/mock-data/inspections'

function genId() {
  return 'insp_' + Date.now() + '_' + Math.random().toString(36).slice(2)
}

export interface InspectionFilters {
  unitId?: string
  status?: InspectionStatus
  type?: InspectionType
}

export async function getInspections(
  filters?: InspectionFilters,
): Promise<{ success: true; data: Inspection[] } | { success: false; error: string }> {
  try {
    let result = inspections
    if (filters?.unitId) result = result.filter((i) => i.unitId === filters.unitId)
    if (filters?.status) result = result.filter((i) => i.status === filters.status)
    if (filters?.type) result = result.filter((i) => i.type === filters.type)
    return { success: true, data: result }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

export async function getInspectionById(
  id: string,
): Promise<{ success: true; data: Inspection } | { success: false; error: string }> {
  try {
    const inspection = inspections.find((i) => i.id === id)
    if (!inspection) return { success: false, error: 'Inspection not found' }
    return { success: true, data: inspection }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

export async function createInspection(
  data: Omit<Inspection, 'id' | 'createdAt'>,
): Promise<{ success: true; data: Inspection } | { success: false; error: string }> {
  try {
    const newInspection: Inspection = {
      ...data,
      id: genId(),
      createdAt: new Date(),
    }
    inspections.push(newInspection)
    revalidatePath('/manager/inspections')
    return { success: true, data: newInspection }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

export async function updateInspection(
  id: string,
  data: Partial<Pick<Inspection, 'status' | 'scheduledAt' | 'completedAt' | 'rooms' | 'photos' | 'notes' | 'conductedBy'>>,
): Promise<{ success: true; data: Inspection } | { success: false; error: string }> {
  try {
    const idx = inspections.findIndex((i) => i.id === id)
    if (idx === -1) return { success: false, error: 'Inspection not found' }

    const now = new Date()
    const updates: Partial<Inspection> = { ...data }

    // Auto-set completedAt when marking as completed
    if (data.status === InspectionStatus.COMPLETED && !inspections[idx].completedAt) {
      updates.completedAt = now
    }

    inspections[idx] = { ...inspections[idx], ...updates }
    revalidatePath('/manager/inspections')
    revalidatePath(`/manager/inspections/${id}`)
    return { success: true, data: inspections[idx] }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}
