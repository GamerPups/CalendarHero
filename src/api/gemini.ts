import type { CalendarChatContext } from '../hooks/useCalendars'
import { parseAssistantReply, type CalendarAction } from '../lib/assistantActions'
import { getApiErrorMessage, readJsonResponse } from './http'
import type { ChatResponse } from './types'

export type ChatMessage = {
  role: 'user' | 'assistant'
  text: string
}

export type ChatResult = {
  text: string
  actions: CalendarAction[]
}

export async function sendChatMessages(
  messages: ChatMessage[],
  calendarContext: CalendarChatContext,
): Promise<ChatResult> {
  let response: Response

  try {
    response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, calendarContext }),
    })
  } catch {
    throw new Error(
      'Could not reach the chat API. Make sure the dev server is running (npm run dev).',
    )
  }

  const payload = await readJsonResponse<ChatResponse>(response)

  if (!response.ok) {
    throw new Error(getApiErrorMessage(payload, 'Chat request failed.'))
  }

  if (!('reply' in payload) || !payload.reply.trim()) {
    throw new Error('Gemini returned an empty response.')
  }

  return parseAssistantReply(payload.reply.trim())
}

export async function checkChatHealth(): Promise<{ ok: boolean; geminiConfigured: boolean }> {
  try {
    const response = await fetch('/api/health')
    const payload = await readJsonResponse<{ ok?: boolean; geminiConfigured?: boolean }>(response)
    return {
      ok: Boolean(payload.ok),
      geminiConfigured: Boolean(payload.geminiConfigured),
    }
  } catch {
    return { ok: false, geminiConfigured: false }
  }
}
