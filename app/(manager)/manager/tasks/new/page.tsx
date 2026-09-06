'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createTask } from '@/lib/actions/task-actions'
import { MaintenancePriority } from '@/types'

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  priority: z.nativeEnum(MaintenancePriority),
  dueDate: z.string().optional(),
  assignedTo: z.string().min(1, 'Assigned To is required'),
})

type TaskFormValues = z.infer<typeof taskSchema>

const PRIORITIES: { value: MaintenancePriority; label: string }[] = [
  { value: MaintenancePriority.HIGH, label: 'High' },
  { value: MaintenancePriority.MEDIUM, label: 'Medium' },
  { value: MaintenancePriority.LOW, label: 'Low' },
]

export default function NewTaskPage() {
  const router = useRouter()
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      priority: MaintenancePriority.MEDIUM,
    },
  })

  const priorityValue = watch('priority')

  async function onSubmit(values: TaskFormValues) {
    setServerError('')
    try {
      const result = await createTask({
        title: values.title,
        description: values.description || undefined,
        priority: values.priority,
        dueDate: values.dueDate ? new Date(values.dueDate) : undefined,
        assignedTo: values.assignedTo,
        status: 'TODO',
      })
      if (result.success) {
        router.push('/manager/tasks')
      } else {
        setServerError('Failed to create task. Please try again.')
      }
    } catch {
      setServerError('Something went wrong.')
    }
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/manager/tasks" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Task</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Task Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Title */}
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                className="mt-1"
                placeholder="Enter task title"
                {...register('title')}
              />
              {errors.title && (
                <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                className="mt-1"
                placeholder="Describe the task..."
                rows={3}
                {...register('description')}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Priority */}
              <div>
                <Label htmlFor="priority">Priority *</Label>
                <Select
                  value={priorityValue}
                  onValueChange={(v) => setValue('priority', v as MaintenancePriority, { shouldValidate: true })}
                >
                  <SelectTrigger id="priority" className="mt-1">
                    <SelectValue placeholder="Select priority..." />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.priority && (
                  <p className="mt-1 text-xs text-red-600">{errors.priority.message}</p>
                )}
              </div>

              {/* Due Date */}
              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  className="mt-1"
                  {...register('dueDate')}
                />
              </div>
            </div>

            {/* Assigned To */}
            <div>
              <Label htmlFor="assignedTo">Assigned To *</Label>
              <Input
                id="assignedTo"
                className="mt-1"
                placeholder="e.g. John Smith"
                {...register('assignedTo')}
              />
              {errors.assignedTo && (
                <p className="mt-1 text-xs text-red-600">{errors.assignedTo.message}</p>
              )}
            </div>

            {serverError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                {serverError}
              </p>
            )}

            <div className="flex items-center gap-3 pt-2">
              <Link href="/manager/tasks">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  'Add Task'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
