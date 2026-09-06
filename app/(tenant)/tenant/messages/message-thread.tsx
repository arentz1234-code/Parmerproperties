'use client'

import { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'
import { cn } from 'cn'
import { formatDate } from '@/lib/utils'

interface Message {
  id: string
  senderId: string
  body: string
  createdAt: Date
}

interface MessageThreadProps {
  messages: Message[]
  currentUserId: string
  onSend: (body: string) => void
  sending?: boolean
}

export function MessageThread({
  messages,
  currentUserId,
  onSend,
  sending,
}: MessageThreadProps) {
  const [body, setBody] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = body.trim()
    if (!trimmed || sending) return
    onSend(trimmed)
    setBody('')
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as unknown as React.FormEvent)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            No messages yet. Say hello!
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.senderId === currentUserId
            return (
              <div
                key={msg.id}
                className={cn(
                  'flex flex-col gap-1 max-w-[75%]',
                  isMine ? 'ml-auto items-end' : 'mr-auto items-start',
                )}
              >
                <div
                  className={cn(
                    'px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap',
                    isMine
                      ? 'bg-[#1b3a5c] text-white rounded-br-sm'
                      : 'bg-gray-100 text-gray-800 rounded-bl-sm',
                  )}
                >
                  {msg.body}
                </div>
                <span className="text-[10px] text-gray-400 px-1">
                  {msg.createdAt.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}{' '}
                  · {formatDate(msg.createdAt)}
                </span>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Compose bar */}
      <form
        onSubmit={handleSubmit}
        className="shrink-0 border-t border-gray-200 p-3 flex items-end gap-2 bg-white"
      >
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message… (Enter to send)"
          rows={2}
          className="flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2d9d5c]/40 focus:border-[#2d9d5c] transition-colors"
        />
        <button
          type="submit"
          disabled={!body.trim() || sending}
          className={cn(
            'size-10 rounded-xl flex items-center justify-center transition-colors shrink-0',
            body.trim() && !sending
              ? 'bg-[#1b3a5c] text-white hover:bg-[#1b3a5c]/80'
              : 'bg-gray-100 text-gray-300 cursor-not-allowed',
          )}
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  )
}
