import type { ChatErrorResponse } from './types'

function isHtmlResponse(text: string): boolean {
  const trimmed = text.trimStart().toLowerCase()
  return trimmed.startsWith('<!doctype') || trimmed.startsWith('<html')
}

export async function readJsonResponse<T>(response: Response): Promise<T> {
  const raw = await response.text()

  if (!raw.trim()) {
    throw new Error('Chat API returned an empty response.')
  }

  try {
    return JSON.parse(raw) as T
  } catch {
    if (isHtmlResponse(raw)) {
      throw new Error(
        'Chat API returned a web page instead of JSON. Run CalendarHero with npm run dev from the CalendarHero folder (not SyncCal).',
      )
    }

    if (raw.includes('Unexpected token') || raw.includes('is not valid JSON')) {
      throw new Error(
        'Chat API misconfigured. Add GEMINI_API_KEY to CalendarHero/.env and restart npm run dev.',
      )
    }

    throw new Error(
      `Chat API returned invalid JSON: ${raw.slice(0, 160)}${raw.length > 160 ? '…' : ''}`,
    )
  }
}

export function getApiErrorMessage(payload: unknown, fallback: string): string {
  if (payload && typeof payload === 'object' && 'error' in payload) {
    const error = (payload as ChatErrorResponse).error
    if (typeof error === 'string' && error.trim()) {
      if (error.includes('Unexpected token') || error.includes('is not valid JSON')) {
        return 'Chat API misconfigured. Add GEMINI_API_KEY to CalendarHero/.env and restart npm run dev.'
      }
      if (error.includes('HTML instead of JSON')) {
        return 'Chat API returned a web page instead of JSON. Run npm run dev from the CalendarHero folder.'
      }
      return error
    }
  }
  return fallback
}
