import Link from 'next/link'
import { Plus, Pencil, CheckCircle, Trash2, ClipboardList } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/status-badge'
import { buttonVariants } from '@/components/ui/button'
import { getTasks } from '@/lib/actions/task-actions'
import { TASK_STATUS_LABELS, PRIORITY_COLORS } from '@/lib/constants'
import { formatDate } from '@/lib/utils'
import { cn } from 'cn'

const FILTER_TABS = [
  { value: 'all', label: 'All' },
  { value: 'TODO', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'DONE', label: 'Done' },
]

export default async function TasksPage() {
  const result = await getTasks()
  const tasks = result.success ? result.data : []

  const counts = {
    all: tasks.length,
    TODO: tasks.filter((t) => t.status === 'TODO').length,
    IN_PROGRESS: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
    DONE: tasks.filter((t) => t.status === 'DONE').length,
  }

  return (
    <div>
      <PageHeader title="Tasks" description="Track to-dos, assignments, and action items">
        <Link href="/manager/tasks/new" className={buttonVariants({})}>
          <Plus size={14} />
          Add Task
        </Link>
      </PageHeader>

      {/* Filter Tabs */}
      <div className="mb-5 flex flex-wrap gap-2">
        {FILTER_TABS.map((tab) => (
          <span
            key={tab.value}
            className={cn(
              'cursor-default rounded-full px-3 py-1 text-sm font-medium',
              tab.value === 'all'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            )}
          >
            {tab.label}
            <span className="ml-1.5 rounded-full bg-white/20 px-1.5 py-0.5 text-xs">
              {counts[tab.value as keyof typeof counts]}
            </span>
          </span>
        ))}
      </div>

      {tasks.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState
              icon={<ClipboardList size={28} />}
              title="No tasks yet"
              description="Create tasks to track action items, follow-ups, and property to-dos."
              action={
                <Link href="/manager/tasks/new" className={buttonVariants({})}>
                  <Plus size={14} />
                  Add Task
                </Link>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    <th className="pb-3 pr-4">Title</th>
                    <th className="pb-3 pr-4">Assigned To</th>
                    <th className="pb-3 pr-4">Due Date</th>
                    <th className="pb-3 pr-4">Priority</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-gray-50">
                      <td className="py-3 pr-4">
                        <p className="font-medium text-gray-900">{task.title}</p>
                        {task.description && (
                          <p className="text-xs text-gray-500 max-w-[200px] truncate">
                            {task.description}
                          </p>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-gray-700">{task.assignedTo}</td>
                      <td className="py-3 pr-4 text-gray-600">
                        {task.dueDate ? formatDate(task.dueDate) : '—'}
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={cn(
                            'inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium',
                            PRIORITY_COLORS[task.priority] ?? 'bg-gray-100 text-gray-700 border-gray-200',
                          )}
                        >
                          {task.priority}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <StatusBadge status={task.status} />
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            className={cn(buttonVariants({ variant: 'outline', size: 'icon-sm' }))}
                            title="Edit"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            className={cn(buttonVariants({ variant: 'outline', size: 'icon-sm' }))}
                            title="Mark Complete"
                          >
                            <CheckCircle size={13} />
                          </button>
                          <button
                            className={cn(buttonVariants({ variant: 'destructive', size: 'icon-sm' }))}
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
