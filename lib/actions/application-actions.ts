'use server'

import { revalidatePath } from 'next/cache'
import { Application, ApplicationStatus } from '@/types'
import { applications } from '@/lib/mock-data/applications'

function genId() {
  return 'app_' + Date.now() + '_' + Math.random().toString(36).slice(2)
}

export interface ApplicationFilters {
  status?: ApplicationStatus
  unitId?: string
}

export async function getApplications(
  filters?: ApplicationFilters,
): Promise<{ success: true; data: Application[] } | { success: false; error: string }> {
  try {
    let result = applications
    if (filters?.status) result = result.filter((a) => a.status === filters.status)
    if (filters?.unitId) result = result.filter((a) => a.unitId === filters.unitId)
    return { success: true, data: result }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

export async function getApplicationById(
  id: string,
): Promise<{ success: true; data: Application } | { success: false; error: string }> {
  try {
    const application = applications.find((a) => a.id === id)
    if (!application) return { success: false, error: 'Application not found' }
    return { success: true, data: application }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

export async function createApplication(
  data: Omit<Application, 'id' | 'submittedAt' | 'status'>,
): Promise<{ success: true; data: Application } | { success: false; error: string }> {
  try {
    const newApplication: Application = {
      ...data,
      id: genId(),
      status: ApplicationStatus.PENDING,
      submittedAt: new Date(),
    }
    applications.push(newApplication)
    revalidatePath('/manager/applications')
    return { success: true, data: newApplication }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

export async function updateApplicationStatus(
  id: string,
  status: ApplicationStatus,
  notes?: string,
): Promise<{ success: true; data: Application } | { success: false; error: string }> {
  try {
    const idx = applications.findIndex((a) => a.id === id)
    if (idx === -1) return { success: false, error: 'Application not found' }

    applications[idx] = {
      ...applications[idx],
      status,
      notes: notes ?? applications[idx].notes,
      decidedAt:
        status === ApplicationStatus.APPROVED || status === ApplicationStatus.DENIED
          ? new Date()
          : applications[idx].decidedAt,
    }
    revalidatePath('/manager/applications')
    revalidatePath(`/manager/applications/${id}`)
    return { success: true, data: applications[idx] }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}
