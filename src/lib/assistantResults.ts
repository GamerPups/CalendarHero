import type { CalendarAction } from './assistantActions'

export type AssistantActionResult =
  | {
      type: 'create_event'
      title: string
      date: string
      time?: string
      calendarName: string
    }
  | { type: 'switch_calendar'; name: string }
  | { type: 'create_shared_calendar'; name: string; shareCode: string }
  | { type: 'join_shared_calendar'; name: string }
  | { type: 'go_to_date'; date: string }
  | { type: 'error'; message: string }

export function isValidEventTime(value: unknown): value is string {
  return typeof value === 'string' && /^([01]?\d|2[0-3]):[0-5]\d$/.test(value)
}

export function getOptionalEventTime(action: Extract<CalendarAction, { type: 'create_event' }>) {
  return isValidEventTime(action.time) ? action.time : undefined
}
