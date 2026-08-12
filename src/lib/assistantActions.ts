export type CalendarAction =
  | { type: 'create_event'; title: string; date: string; calendarId?: string; color?: string }
  | { type: 'switch_calendar'; calendarId: string }
  | { type: 'create_shared_calendar'; name: string }
  | { type: 'join_shared_calendar'; shareCode: string }
  | { type: 'go_to_date'; date: string }

const ACTION_BLOCK_REGEX = /<<<ACTIONS>>>\s*([\s\S]*?)\s*<<<END_ACTIONS>>>/i

export function parseAssistantReply(raw: string): { text: string; actions: CalendarAction[] } {
  const match = raw.match(ACTION_BLOCK_REGEX)
  if (!match) {
    return { text: raw.trim(), actions: [] }
  }

  const text = raw.replace(ACTION_BLOCK_REGEX, '').trim()
  try {
    const parsed = JSON.parse(match[1]) as unknown
    const actions = Array.isArray(parsed) ? parsed.filter(isCalendarAction) : []
    return { text, actions }
  } catch {
    return { text: raw.trim(), actions: [] }
  }
}

function isCalendarAction(value: unknown): value is CalendarAction {
  if (!value || typeof value !== 'object' || !('type' in value)) return false
  const action = value as CalendarAction

  switch (action.type) {
    case 'create_event':
      return (
        typeof action.title === 'string' &&
        typeof action.date === 'string' &&
        /^\d{4}-\d{2}-\d{2}$/.test(action.date)
      )
    case 'switch_calendar':
      return typeof action.calendarId === 'string'
    case 'create_shared_calendar':
      return typeof action.name === 'string'
    case 'join_shared_calendar':
      return typeof action.shareCode === 'string'
    case 'go_to_date':
      return typeof action.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(action.date)
    default:
      return false
  }
}
