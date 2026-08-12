import type { DisplayEvent } from './sharedVisibility'
import {
  addDaysToIsoDate,
  getCurrentMinutes,
  parseEventMinutes,
  todayIsoDate,
} from './calendar-utils'

export type AgendaDayGroup = {
  date: string
  events: DisplayEvent[]
}

export type HomeEventGroup = {
  id: 'now' | 'later' | 'tomorrow'
  label: string
  events: DisplayEvent[]
}

export function groupEventsForHome(events: DisplayEvent[]): HomeEventGroup[] {
  const today = todayIsoDate()
  const tomorrow = addDaysToIsoDate(today, 1)
  const nowMinutes = getCurrentMinutes()

  const todayEvents = events
    .filter((event) => event.date === today)
    .sort(compareEvents)

  const nowEvents = todayEvents.filter((event) => {
    const minutes = parseEventMinutes(event.time)
    if (minutes === null) return true
    return minutes <= nowMinutes + 60
  })

  const laterEvents = todayEvents.filter((event) => !nowEvents.includes(event))

  const tomorrowEvents = events
    .filter((event) => event.date === tomorrow)
    .sort(compareEvents)

  return [
    { id: 'now', label: 'Now', events: nowEvents },
    { id: 'later', label: 'Later', events: laterEvents },
    { id: 'tomorrow', label: 'Tomorrow', events: tomorrowEvents },
  ]
}

export function buildAgendaDayGroups(events: DisplayEvent[], startDate: string, dayCount: number): AgendaDayGroup[] {
  const groups: AgendaDayGroup[] = []

  for (let offset = 0; offset < dayCount; offset += 1) {
    const date = addDaysToIsoDate(startDate, offset)
    const dayEvents = events.filter((event) => event.date === date).sort(compareEvents)
    groups.push({ date, events: dayEvents })
  }

  return groups
}

function compareEvents(left: DisplayEvent, right: DisplayEvent): number {
  const leftMinutes = parseEventMinutes(left.time) ?? 0
  const rightMinutes = parseEventMinutes(right.time) ?? 0
  if (leftMinutes !== rightMinutes) return leftMinutes - rightMinutes
  return left.title.localeCompare(right.title)
}
