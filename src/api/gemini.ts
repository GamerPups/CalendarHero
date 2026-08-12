import type { CalendarChatContext } from '../hooks/useCalendars'
import { parseAssistantReply, type CalendarAction } from '../lib/assistantActions'

export type ChatMessage = {
  role: 'user' | 'assistant'
  text: string
}

type ChatResponse = {
  reply: string
}

type ChatErrorResponse = {
  error: string
}

export type ChatResult = {
  text: string
  actions: CalendarAction[]
}

export async function sendChatMessages(
  messages: ChatMessage[],
  calendarContext: CalendarChatContext,
): Promise<ChatResult> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, calendarContext }),
  })

  const payload = (await response.json()) as ChatResponse | ChatErrorResponse

  if (!response.ok) {
    const error = 'error' in payload ? payload.error : 'Chat request failed.'
    throw new Error(error)
  }

  if (!('reply' in payload) || !payload.reply.trim()) {
    throw new Error('Gemini returned an empty response.')
  }

  return parseAssistantReply(payload.reply.trim())
}
