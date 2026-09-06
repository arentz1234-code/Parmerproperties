'use client'

import { useState, useTransition } from 'react'
import { Message } from '@/types'
import { sendMessage } from '@/lib/actions/message-actions'
import { Send } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface ThreadViewProps {
  messages: Message[]
  currentUserId: string
  threadId: string
  recipientId: string
}

export function ThreadView({ messages, currentUserId, threadId, recipientId }: ThreadViewProps) {
  const [body, setBody] = useState('')
  const [pending, startTransition] = useTransition()

  function handleSend() {
    if (!body.trim()) return
    startTransition(async () => {
      await sendMessage({ threadId, receiverId: recipientId, body, senderId: currentUserId })
      setBody('')
    })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => {
          const isMine = msg.senderId === currentUserId
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl text-sm ${
                  isMine ? 'bg-[#2D3561] text-white' : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p>{msg.body}</p>
                <p className={`text-xs mt-1 ${isMine ? 'text-blue-200' : 'text-gray-500'}`}>
                  {formatDate(msg.createdAt)}
                </p>
              </div>
            </div>
          )
        })}
      </div>
      <div className="border-t p-4 flex gap-2">
        <input
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3561]"
          placeholder="Type a message..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
        />
        <button
          onClick={handleSend}
          disabled={pending || !body.trim()}
          className="p-2 bg-[#2D3561] text-white rounded-lg hover:bg-[#1f2547] disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  )
}
