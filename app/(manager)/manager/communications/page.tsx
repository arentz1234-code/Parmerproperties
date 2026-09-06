import { getThreads, getThread } from '@/lib/actions/message-actions'
import { Message } from '@/types'
import { PageHeader } from '@/components/shared/page-header'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { ThreadList } from './thread-list'
import { ThreadView } from './thread-view'

const MANAGER_ID = 'user_manager_001'

// Tenant display names (mapped from mock data)
const TENANT_NAMES: Record<string, string> = {
  user_tenant_001: 'Sarah Mitchell',
  user_tenant_002: 'Jordan Hayes',
  user_tenant_003: 'Madison Carter',
  user_tenant_004: 'Tyler Brooks',
  user_tenant_005: 'Emily Nguyen',
  user_tenant_006: 'Marcus Williams',
  user_tenant_007: 'Olivia Thornton',
  user_tenant_008: 'Caleb Johnson',
  user_manager_001: 'Andrew Rentz (You)',
}

export default async function CommunicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ thread?: string }>
}) {
  const { thread: activeThreadId } = await searchParams

  const threadsResult = await getThreads(MANAGER_ID)
  const threads = threadsResult.success ? threadsResult.data : []

  let activeMessages: Message[] = []
  if (activeThreadId) {
    const threadResult = await getThread(activeThreadId)
    if (threadResult.success) activeMessages = threadResult.data
  }

  const activeThread = threads.find((t) => t.threadId === activeThreadId)

  return (
    <div>
      <PageHeader title="Communications">
        <Link
          href="/manager/communications/new"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <Plus size={15} />
          New Message
        </Link>
      </PageHeader>

      <div className="flex gap-0 rounded-xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden" style={{ height: 'calc(100vh - 230px)', minHeight: '500px' }}>
        {/* Thread List */}
        <div className="w-80 shrink-0 border-r border-gray-200 overflow-y-auto">
          <ThreadList
            threads={threads}
            activeThreadId={activeThreadId}
            tenantNames={TENANT_NAMES}
            managerId={MANAGER_ID}
          />
        </div>

        {/* Thread View */}
        <div className="flex-1 min-w-0 flex flex-col">
          {activeThreadId && activeMessages.length > 0 ? (
            <ThreadView
              messages={activeMessages}
              currentUserId={MANAGER_ID}
              threadId={activeThreadId}
              recipientId={
                activeThread?.participants.find((p) => p !== MANAGER_ID) ?? ''
              }
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <div className="text-4xl mb-3">💬</div>
                <p className="text-sm font-medium">Select a conversation</p>
                <p className="text-xs mt-1">Choose a thread from the left to view messages</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
