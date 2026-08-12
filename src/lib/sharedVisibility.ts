import type { UserEvent } from '../hooks/useCalendars'

export type DisplayEvent = UserEvent & {
  source: 'native' | 'personal'
  sourceCalendarName?: string
}

export function getEventsForCalendarView(
  activeCalendar: { id: string; kind: 'personal' | 'shared' },
  events: UserEvent[],
  personalCalendars: Array<{ id: string; name: string }>,
  personalVisibilityByShared: Record<string, string[]>,
): DisplayEvent[] {
  if (activeCalendar.kind === 'personal') {
    return events
      .filter((event) => event.calendarId === activeCalendar.id)
      .map((event) => ({ ...event, source: 'native' as const }))
  }

  const visiblePersonalIds = personalVisibilityByShared[activeCalendar.id] ?? []
  const native = events
    .filter((event) => event.calendarId === activeCalendar.id)
    .map((event) => ({ ...event, source: 'native' as const }))

  const mirrored = events
    .filter(
      (event) =>
        event.sharedVisible === true &&
        visiblePersonalIds.includes(event.calendarId) &&
        personalCalendars.some((calendar) => calendar.id === event.calendarId),
    )
    .map((event) => ({
      ...event,
      source: 'personal' as const,
      sourceCalendarName:
        personalCalendars.find((calendar) => calendar.id === event.calendarId)?.name ??
        'Personal',
    }))

  return [...native, ...mirrored]
}

export function resolvePersonalSelection(
  personalCalendars: Array<{ id: string }>,
  selectedIds: string[],
): string[] {
  if (selectedIds.includes('__all__')) {
    return personalCalendars.map((calendar) => calendar.id)
  }
  return selectedIds.filter((id) => personalCalendars.some((calendar) => calendar.id === id))
}

export function isPersonalCalendarEvent(
  event: UserEvent,
  personalCalendarIds: Set<string>,
): boolean {
  return personalCalendarIds.has(event.calendarId)
}
