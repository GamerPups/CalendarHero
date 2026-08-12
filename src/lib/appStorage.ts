import {
  createDefaultCategoryColors,
  type EventCategory,
  type EventColor,
} from './calendar-utils'

const STORAGE_KEY = 'calendar-hero-state-v3'

type StoredCalendar = {
  id: string
  name: string
  kind: 'personal' | 'shared'
  shareCode?: string
}

type StoredEvent = {
  id: string
  calendarId: string
  title: string
  date: string
  time?: string
  color: EventColor
  category?: EventCategory
  sharedVisible?: boolean
}

export type PersistedAppState = {
  personalCalendars: StoredCalendar[]
  sharedCalendars: StoredCalendar[]
  activeCalendarId: string
  events: StoredEvent[]
  personalVisibilityByShared: Record<string, string[]>
  defaultEventColor: EventColor
  defaultEventCategory?: EventCategory
  categoryColors?: Partial<Record<EventCategory, EventColor>>
}

export function createDefaultPersonalCalendar(): StoredCalendar {
  return {
    id: crypto.randomUUID(),
    name: 'My Calendar',
    kind: 'personal',
  }
}

export function createEmptyAppState(): PersistedAppState {
  const personalCalendar = createDefaultPersonalCalendar()

  return {
    personalCalendars: [personalCalendar],
    sharedCalendars: [],
    activeCalendarId: personalCalendar.id,
    events: [],
    personalVisibilityByShared: {},
    defaultEventColor: 'cyan',
    defaultEventCategory: 'other',
    categoryColors: createDefaultCategoryColors(),
  }
}

export function loadPersistedAppState(): PersistedAppState | null {
  if (typeof window === 'undefined') return null

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as PersistedAppState
    if (!parsed.personalCalendars?.length) return null
    if (!parsed.activeCalendarId) return null

    const allIds = new Set([
      ...parsed.personalCalendars.map((calendar) => calendar.id),
      ...(parsed.sharedCalendars ?? []).map((calendar) => calendar.id),
    ])

    if (!allIds.has(parsed.activeCalendarId)) return null

    return {
      personalCalendars: parsed.personalCalendars,
      sharedCalendars: parsed.sharedCalendars ?? [],
      activeCalendarId: parsed.activeCalendarId,
      events: (parsed.events ?? []).map((event) => ({
        ...event,
        sharedVisible: event.sharedVisible ?? false,
        category: event.category ?? undefined,
      })),
      personalVisibilityByShared: parsed.personalVisibilityByShared ?? {},
      defaultEventColor: parsed.defaultEventColor ?? 'cyan',
      defaultEventCategory: parsed.defaultEventCategory ?? 'other',
      categoryColors: {
        ...createDefaultCategoryColors(),
        ...(parsed.categoryColors ?? {}),
      },
    }
  } catch {
    return null
  }
}

export function savePersistedAppState(state: PersistedAppState): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}
