'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { MessageCircle, User, ChevronLeft } from 'lucide-react'
import { cn } from 'cn'
import { MessageThread } from './message-thread'
import {
  getThreads,
  getThread,
  sendMessage,
  type MessageThread as TMessageThread,
} from '@/lib/actions/message-actions'
import type { Message } from '@/types'

const MANAGER_ID = 'user_manager_001'
const MANAGER_NAME = 'Andrew Rentz'

export default function TenantMessagesPage() {
  const { data: session } = useSession()
  const currentUserId =
    (session?.user as { id?: string } | undefined)?.id ?? 'user_tenant_001'

  const [threads, setThreads] = useState<TMessageThread[]>([])
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null)
  const [activeMessages, setActiveMessages] = useState<Message[]>([])
  const [sending, setSending] = useState(false)
  const [showThread, setShowThread] = useState(false) // mobile: show thread panel

  const loadThreads = useCallback(async () => {
    const result = await getThreads(currentUserId)
    if (result.success) setThreads(result.data)
  }, [currentUserId])

  const loadMessages = useCallback(async (threadId: string) => {
    const result = await getThread(threadId)
    if (result.success) setActiveMessages(result.data)
  }, [])

  useEffect(() => {
    loadThreads()
  }, [loadThreads])

  async function handleSelectThread(threadId: string) {
    setActiveThreadId(threadId)
    setShowThread(true)
    await loadMessages(threadId)
  }

  async function handleSend(body: string) {
    if (!body.trim()) return
    setSending(true)
    try {
      const result = await sendMessage({
        threadId: activeThreadId ?? undefined,
        receiverId: MANAGER_ID,
        body,
        senderId: currentUserId,
      })
      if (result.success) {
        if (!activeThreadId) {
          setActiveThreadId(result.data.threadId)
        }
        await loadMessages(result.data.threadId)
        await loadThreads()
      }
    } finally {
      setSending(false)
    }
  }

  async function handleNewConversation() {
    setActiveThreadId(null)
    setActiveMessages([])
    setShowThread(true)
  }

  const activeThread = threads.find((t) => t.threadId === activeThreadId)

  return (
    <div className="flex flex-col gap-4 h-full max-w-5xl mx-auto">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-500 mt-0.5 text-sm">
            Chat with your property manager.
          </p>
        </div>
        <button
          onClick={handleNewConversation}
          className="inline-flex items-center gap-2 rounded-xl bg-[#1b3a5c] px-4 py-2 text-sm font-medium text-white hover:bg-[#1b3a5c]/80 transition-colors"
        >
          <MessageCircle size={15} />
          New Message
        </button>
      </div>

      <div
        className="flex rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden"
        style={{ height: 'calc(100vh - 230px)', minHeight: '500px' }}
      >
        {/* Thread list */}
        <div
          className={cn(
            'w-full md:w-72 shrink-0 border-r border-gray-200 flex flex-col',
            showThread ? 'hidden md:flex' : 'flex',
          )}
        >
          <div className="px-4 py-3 border-b border-gray-100 shrink-0">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Conversations
            </p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {threads.length === 0 ? (
              <div className="p-6 text-center">
                <MessageCircle size={28} className="text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No messages yet.</p>
                <button
                  onClick={handleNewConversation}
                  className="mt-3 text-sm text-[#2d9d5c] font-medium hover:underline"
                >
                  Start a conversation
                </button>
              </div>
            ) : (
              threads.map((thread) => {
                const isActive = thread.threadId === activeThreadId
                const isUnread =
                  !thread.latestMessage.readAt &&
                  thread.latestMessage.senderId !== currentUserId
                const preview = thread.latestMessage.body.slice(0, 70)

                return (
                  <button
                    key={thread.threadId}
                    onClick={() => handleSelectThread(thread.threadId)}
                    className={cn(
                      'w-full text-left px-4 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors',
                      isActive && 'bg-[#1b3a5c]/5 border-l-2 border-l-[#1b3a5c]',
                    )}
                  >
                    {/* Contact */}
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <div className="size-8 rounded-full bg-[#1b3a5c] flex items-center justify-center shrink-0">
                        <User size={14} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p
                            className={cn(
                              'text-sm truncate',
                              isUnread
                                ? 'font-semibold text-gray-900'
                                : 'font-medium text-gray-700',
                            )}
                          >
                            {MANAGER_NAME}
                          </p>
                          <div className="flex items-center gap-1 shrink-0">
                            {isUnread && (
                              <span className="size-2 rounded-full bg-[#2d9d5c]" />
                            )}
                            <span className="text-[10px] text-gray-400">
                              {thread.latestMessage.createdAt.toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {thread.latestMessage.subject && (
                      <p className="text-xs font-medium text-gray-600 mb-0.5 truncate pl-10">
                        {thread.latestMessage.subject}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 truncate pl-10">{preview}</p>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Thread view */}
        <div
          className={cn(
            'flex-1 min-w-0 flex flex-col',
            showThread ? 'flex' : 'hidden md:flex',
          )}
        >
          {/* Thread header */}
          {(activeThreadId || showThread) && (
            <div className="shrink-0 px-4 py-3 border-b border-gray-200 flex items-center gap-3">
              <button
                onClick={() => setShowThread(false)}
                className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft size={18} className="text-gray-600" />
              </button>
              <div className="size-8 rounded-full bg-[#1b3a5c] flex items-center justify-center shrink-0">
                <User size={14} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{MANAGER_NAME}</p>
                <p className="text-xs text-gray-400">Property Manager</p>
              </div>
            </div>
          )}

          {showThread ? (
            <MessageThread
              messages={activeMessages.map((m) => ({
                id: m.id,
                senderId: m.senderId,
                body: m.body,
                createdAt: m.createdAt,
              }))}
              currentUserId={currentUserId}
              onSend={handleSend}
              sending={sending}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <MessageCircle size={40} className="text-gray-200 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-600">
                  Select a conversation
                </p>
                <p className="text-xs mt-1 text-gray-400">
                  Choose a thread on the left, or start a new message.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
