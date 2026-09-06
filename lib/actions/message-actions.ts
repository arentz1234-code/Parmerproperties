'use server'

import { revalidatePath } from 'next/cache'
import { Message } from '@/types'
import { messages } from '@/lib/mock-data/messages'

function genId() {
  return 'msg_' + Date.now() + '_' + Math.random().toString(36).slice(2)
}

function genThreadId() {
  return 'thread_' + Date.now() + '_' + Math.random().toString(36).slice(2)
}

export interface MessageThread {
  threadId: string
  subject?: string
  latestMessage: Message
  messageCount: number
  participants: string[]
}

export async function getMessages(
  userId: string,
): Promise<{ success: true; data: Message[] } | { success: false; error: string }> {
  try {
    const result = messages.filter(
      (m) => m.senderId === userId || m.receiverIds.includes(userId),
    )
    return { success: true, data: result }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

export async function getThreads(
  userId: string,
): Promise<{ success: true; data: MessageThread[] } | { success: false; error: string }> {
  try {
    // Get all messages for this user
    const userMessages = messages.filter(
      (m) => m.senderId === userId || m.receiverIds.includes(userId),
    )

    // Group by threadId
    const threadMap = new Map<string, Message[]>()
    for (const msg of userMessages) {
      const existing = threadMap.get(msg.threadId) ?? []
      existing.push(msg)
      threadMap.set(msg.threadId, existing)
    }

    const threads: MessageThread[] = []
    for (const [threadId, threadMessages] of threadMap) {
      // Sort by createdAt descending to get latest
      const sorted = [...threadMessages].sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
      )
      const latestMessage = sorted[0]

      // Collect all participant IDs in this thread
      const participantSet = new Set<string>()
      for (const m of threadMessages) {
        participantSet.add(m.senderId)
        m.receiverIds.forEach((id) => participantSet.add(id))
      }

      threads.push({
        threadId,
        subject: latestMessage.subject,
        latestMessage,
        messageCount: threadMessages.length,
        participants: Array.from(participantSet),
      })
    }

    // Sort threads by latest message date descending
    threads.sort(
      (a, b) =>
        b.latestMessage.createdAt.getTime() - a.latestMessage.createdAt.getTime(),
    )

    return { success: true, data: threads }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

export async function getThread(
  threadId: string,
): Promise<{ success: true; data: Message[] } | { success: false; error: string }> {
  try {
    const result = messages
      .filter((m) => m.threadId === threadId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    return { success: true, data: result }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

export async function sendMessage(data: {
  threadId?: string
  receiverId: string
  subject?: string
  body: string
  senderId: string
}): Promise<{ success: true; data: Message } | { success: false; error: string }> {
  try {
    const now = new Date()
    const newMessage: Message = {
      id: genId(),
      threadId: data.threadId ?? genThreadId(),
      senderId: data.senderId,
      receiverIds: [data.receiverId],
      subject: data.subject,
      body: data.body,
      createdAt: now,
    }
    messages.push(newMessage)
    revalidatePath('/manager/messages')
    revalidatePath('/tenant/messages')
    return { success: true, data: newMessage }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

export async function markAsRead(
  messageId: string,
): Promise<{ success: true; data: Message } | { success: false; error: string }> {
  try {
    const idx = messages.findIndex((m) => m.id === messageId)
    if (idx === -1) return { success: false, error: 'Message not found' }
    messages[idx] = { ...messages[idx], readAt: new Date() }
    revalidatePath('/manager/messages')
    revalidatePath('/tenant/messages')
    return { success: true, data: messages[idx] }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}
