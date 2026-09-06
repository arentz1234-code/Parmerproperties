'use client'

import Link from 'next/link'
import { cn } from 'cn'
import { MessageThread } from '@/lib/actions/message-actions'

interface ThreadListProps {
  threads: MessageThread[]
  activeThreadId?: string
  tenantNames: Record<string, string>
  managerId: string
}

function getOtherParticipants(thread: MessageThread, managerId: string, names: Record<string, string>): string {
  const others = thread.participants.filter((p) => p !== managerId)
  if (others.length === 0) return 'Unknown'
  if (others.length <= 2) return others.map((id) => names[id] ?? id).join(', ')
  return `${names[others[0]] ?? others[0]} +${others.length - 1} others`
}

export function ThreadList({ threads, activeThreadId, tenantNames, managerId }: ThreadListProps) {
  if (threads.length === 0) {
    return (
      <div className="p-6 text-center text-sm text-gray-400">
        No conversations yet.
      </div>
    )
  }

  return (
    <div>
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          {threads.length} Conversation{threads.length !== 1 ? 's' : ''}
        </p>
      </div>
      {threads.map((thread) => {
        const isActive = thread.threadId === activeThreadId
        const displayName = getOtherParticipants(thread, managerId, tenantNames)
        const preview = thread.latestMessage.body.slice(0, 80)
        const isUnread = !thread.latestMessage.readAt && thread.latestMessage.senderId !== managerId

        return (
          <Link
            key={thread.threadId}
            href={`/communications?thread=${thread.threadId}`}
            className={cn(
              'block px-4 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors',
              isActive && 'bg-blue-50 border-l-2 border-l-blue-500',
            )}
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <p className={cn('text-sm leading-tight', isUnread ? 'font-semibold text-gray-900' : 'font-medium text-gray-700')}>
                {displayName}
              </p>
              <div className="flex items-center gap-1.5 shrink-0">
                {isUnread && (
                  <span className="size-2 rounded-full bg-blue-500" />
                )}
                <span className="text-xs text-gray-400">
                  {thread.latestMessage.createdAt.toLocaleDateString()}
                </span>
              </div>
            </div>
            {thread.latestMessage.subject && (
              <p className="text-xs font-medium text-gray-600 mb-0.5 truncate">
                {thread.latestMessage.subject}
              </p>
            )}
            <p className="text-xs text-gray-400 truncate">{preview}</p>
          </Link>
        )
      })}
    </div>
  )
}
