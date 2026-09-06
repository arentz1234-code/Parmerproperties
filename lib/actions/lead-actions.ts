'use server'

import { revalidatePath } from 'next/cache'
import { Lead, LeadStatus, LeadSource } from '@/types'
import { leads } from '@/lib/mock-data/leads'

function genId() {
  return 'lead_' + Date.now() + '_' + Math.random().toString(36).slice(2)
}

export interface LeadFilters {
  status?: LeadStatus
  propertyId?: string
}

export async function getLeads(
  filters?: LeadFilters,
): Promise<{ success: true; data: Lead[] } | { success: false; error: string }> {
  try {
    let result = leads
    if (filters?.status) result = result.filter((l) => l.status === filters.status)
    if (filters?.propertyId) result = result.filter((l) => l.propertyId === filters.propertyId)
    return { success: true, data: result }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

export async function createLead(
  data: Omit<Lead, 'id' | 'createdAt'>,
): Promise<{ success: true; data: Lead } | { success: false; error: string }> {
  try {
    const newLead: Lead = {
      ...data,
      id: genId(),
      createdAt: new Date(),
    }
    leads.push(newLead)
    revalidatePath('/manager/leads')
    return { success: true, data: newLead }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

export async function updateLead(
  id: string,
  data: Partial<Pick<Lead, 'status' | 'notes' | 'phone' | 'email' | 'name' | 'unitId' | 'propertyId' | 'source'>>,
): Promise<{ success: true; data: Lead } | { success: false; error: string }> {
  try {
    const idx = leads.findIndex((l) => l.id === id)
    if (idx === -1) return { success: false, error: 'Lead not found' }
    leads[idx] = { ...leads[idx], ...data }
    revalidatePath('/manager/leads')
    return { success: true, data: leads[idx] }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

export async function deleteLead(
  id: string,
): Promise<{ success: true; data: { id: string } } | { success: false; error: string }> {
  try {
    const idx = leads.findIndex((l) => l.id === id)
    if (idx === -1) return { success: false, error: 'Lead not found' }
    leads.splice(idx, 1)
    revalidatePath('/manager/leads')
    return { success: true, data: { id } }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}
