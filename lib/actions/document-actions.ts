'use server'

import { revalidatePath } from 'next/cache'
import { Document, DocumentCategory } from '@/types'
import { documents } from '@/lib/mock-data/documents'

function genId() {
  return 'doc_' + Date.now() + '_' + Math.random().toString(36).slice(2)
}

export interface DocumentFilters {
  propertyId?: string
  unitId?: string
  tenantId?: string
  leaseId?: string
  category?: DocumentCategory
}

export async function getDocuments(
  filters?: DocumentFilters,
): Promise<{ success: true; data: Document[] } | { success: false; error: string }> {
  try {
    let result = documents
    if (filters?.propertyId) result = result.filter((d) => d.propertyId === filters.propertyId)
    if (filters?.unitId) result = result.filter((d) => d.unitId === filters.unitId)
    if (filters?.tenantId) result = result.filter((d) => d.tenantId === filters.tenantId)
    if (filters?.leaseId) result = result.filter((d) => d.leaseId === filters.leaseId)
    if (filters?.category) result = result.filter((d) => d.category === filters.category)
    return { success: true, data: result }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

export async function createDocument(
  data: Omit<Document, 'id' | 'url' | 'createdAt'>,
): Promise<{ success: true; data: Document } | { success: false; error: string }> {
  try {
    const id = genId()
    const newDocument: Document = {
      ...data,
      id,
      url: `/mock-docs/${id}.pdf`,
      createdAt: new Date(),
    }
    documents.push(newDocument)
    revalidatePath('/manager/documents')
    return { success: true, data: newDocument }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

export async function deleteDocument(
  id: string,
): Promise<{ success: true; data: { id: string } } | { success: false; error: string }> {
  try {
    const idx = documents.findIndex((d) => d.id === id)
    if (idx === -1) return { success: false, error: 'Document not found' }
    documents.splice(idx, 1)
    revalidatePath('/manager/documents')
    return { success: true, data: { id } }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}
