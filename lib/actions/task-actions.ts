'use server'

import { revalidatePath } from 'next/cache'
import { Task, TaskStatus, MaintenancePriority } from '@/types'
import { tasks } from '@/lib/mock-data/tasks'

function genId() {
  return 'task_' + Date.now() + '_' + Math.random().toString(36).slice(2)
}

export interface TaskFilters {
  assignedTo?: string
  status?: TaskStatus
}

export async function getTasks(
  filters?: TaskFilters,
): Promise<{ success: true; data: Task[] } | { success: false; error: string }> {
  try {
    let result = tasks
    if (filters?.assignedTo) result = result.filter((t) => t.assignedTo === filters.assignedTo)
    if (filters?.status) result = result.filter((t) => t.status === filters.status)
    return { success: true, data: result }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

export async function createTask(
  data: Omit<Task, 'id' | 'createdAt'>,
): Promise<{ success: true; data: Task } | { success: false; error: string }> {
  try {
    const newTask: Task = {
      ...data,
      id: genId(),
      createdAt: new Date(),
    }
    tasks.push(newTask)
    revalidatePath('/manager/tasks')
    return { success: true, data: newTask }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

export async function updateTask(
  id: string,
  data: Partial<Pick<Task, 'title' | 'description' | 'assignedTo' | 'dueDate' | 'priority' | 'status'>>,
): Promise<{ success: true; data: Task } | { success: false; error: string }> {
  try {
    const idx = tasks.findIndex((t) => t.id === id)
    if (idx === -1) return { success: false, error: 'Task not found' }
    tasks[idx] = { ...tasks[idx], ...data }
    revalidatePath('/manager/tasks')
    return { success: true, data: tasks[idx] }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

export async function deleteTask(
  id: string,
): Promise<{ success: true; data: { id: string } } | { success: false; error: string }> {
  try {
    const idx = tasks.findIndex((t) => t.id === id)
    if (idx === -1) return { success: false, error: 'Task not found' }
    tasks.splice(idx, 1)
    revalidatePath('/manager/tasks')
    return { success: true, data: { id } }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}
