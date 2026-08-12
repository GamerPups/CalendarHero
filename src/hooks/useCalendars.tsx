import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { generateShareCode, formatShareCode } from '../lib/shareCode'
import {
  type EventColor,
  normalizeEventColor,
  formatMonthTitle,
  parseIsoDate,
  todayIsoDate,
} from '../lib/calendar-utils'
import type { CalendarAction } from '../lib/assistantActions'
import type { AssistantActionResult } from '../lib/assistantResults'
import { getOptionalEventTime } from '../lib/assistantResults'
import {
  getEventsForCalendarView,
  type DisplayEvent,
} from '../lib/sharedVisibility'
import {
  createEmptyAppState,
  loadPersistedAppState,
  savePersistedAppState,
} from '../lib/appStorage'

export type CalendarKind = 'personal' | 'shared'

export type UserCalendar = {
  id: string
  name: string
  kind: CalendarKind
  shareCode?: string
}

export type UserEvent = {
  id: string
  calendarId: string
  title: string
  date: string
  time?: string
  color: EventColor
  sharedVisible?: boolean
}

export type CalendarChatContext = {
  today: string
  viewMonth: string
  activeCalendar: UserCalendar
  defaultEventColor: EventColor
  personalCalendars: UserCalendar[]
  sharedCalendars: UserCalendar[]
  events: Array<UserEvent & { calendarName: string }>
}

type AddEventOptions = {
  calendarId?: string
  color?: EventColor
  time?: string
  sharedVisible?: boolean
}

type UpdateEventInput = {
  title?: string
  date?: string
  time?: string
  color?: EventColor
  sharedVisible?: boolean
}

type CalendarsContextValue = {
  personalCalendars: UserCalendar[]
  sharedCalendars: UserCalendar[]
  allCalendars: UserCalendar[]
  activeCalendarId: string
  activeCalendar: UserCalendar
  events: UserEvent[]
  displayEvents: DisplayEvent[]
  activeCalendarEvents: DisplayEvent[]
  viewYear: number
  viewMonth: number
  viewMonthLabel: string
  defaultEventColor: EventColor
  setDefaultEventColor: (color: EventColor) => void
  setActiveCalendarId: (id: string) => void
  goToToday: () => void
  goToPreviousMonth: () => void
  goToNextMonth: () => void
  goToDate: (date: string) => void
  addPersonalCalendar: (name: string) => UserCalendar
  createSharedCalendar: (name: string) => UserCalendar
  joinSharedCalendar: (shareCode: string) => UserCalendar | null
  addEvent: (title: string, date: string, options?: AddEventOptions) => UserEvent | null
  updateEvent: (eventId: string, updates: UpdateEventInput) => UserEvent | null
  deleteEvent: (eventId: string) => boolean
  getEventById: (eventId: string) => UserEvent | undefined
  setSharedPersonalVisibility: (sharedCalendarId: string, personalCalendarIds: string[]) => void
  getVisiblePersonalOnShared: (sharedCalendarId: string) => string[]
  applyAssistantActions: (actions: CalendarAction[]) => AssistantActionResult[]
  getChatContext: () => CalendarChatContext
}

const CalendarsContext = createContext<CalendarsContextValue | null>(null)

function readInitialState() {
  return loadPersistedAppState() ?? createEmptyAppState()
}

export function CalendarsProvider({ children }: { children: ReactNode }) {
  const today = todayIsoDate()
  const todayParts = parseIsoDate(today)
  const initialState = readInitialState()

  const [personalCalendars, setPersonalCalendars] = useState<UserCalendar[]>(
    initialState.personalCalendars,
  )
  const [sharedCalendars, setSharedCalendars] = useState<UserCalendar[]>(
    initialState.sharedCalendars,
  )
  const [activeCalendarId, setActiveCalendarId] = useState(initialState.activeCalendarId)
  const [events, setEvents] = useState<UserEvent[]>(initialState.events)
  const [viewYear, setViewYear] = useState(todayParts.year)
  const [viewMonth, setViewMonth] = useState(todayParts.month)
  const [defaultEventColor, setDefaultEventColor] = useState<EventColor>(
    initialState.defaultEventColor,
  )
  const [personalVisibilityByShared, setPersonalVisibilityByShared] = useState<
    Record<string, string[]>
  >(initialState.personalVisibilityByShared)

  const allCalendars = useMemo(
    () => [...personalCalendars, ...sharedCalendars],
    [personalCalendars, sharedCalendars],
  )

  const activeCalendar =
    allCalendars.find((calendar) => calendar.id === activeCalendarId) ??
    personalCalendars[0] ??
    createEmptyAppState().personalCalendars[0]

  const displayEvents = useMemo(
    () =>
      getEventsForCalendarView(
        activeCalendar,
        events,
        personalCalendars,
        personalVisibilityByShared,
      ),
    [activeCalendar, events, personalCalendars, personalVisibilityByShared],
  )

  const viewMonthLabel = formatMonthTitle(viewYear, viewMonth)

  const setSharedPersonalVisibility = useCallback(
    (sharedCalendarId: string, personalCalendarIds: string[]) => {
      setPersonalVisibilityByShared((current) => ({
        ...current,
        [sharedCalendarId]: personalCalendarIds,
      }))
    },
    [],
  )

  const getVisiblePersonalOnShared = useCallback(
    (sharedCalendarId: string) => personalVisibilityByShared[sharedCalendarId] ?? [],
    [personalVisibilityByShared],
  )

  useEffect(() => {
    savePersistedAppState({
      personalCalendars,
      sharedCalendars,
      activeCalendarId,
      events,
      personalVisibilityByShared,
      defaultEventColor,
    })
  }, [
    personalCalendars,
    sharedCalendars,
    activeCalendarId,
    events,
    personalVisibilityByShared,
    defaultEventColor,
  ])

  const goToDate = useCallback((date: string) => {
    const parts = parseIsoDate(date)
    setViewYear(parts.year)
    setViewMonth(parts.month)
  }, [])

  const goToToday = useCallback(() => {
    goToDate(todayIsoDate())
  }, [goToDate])

  const goToPreviousMonth = useCallback(() => {
    setViewMonth((currentMonth) => {
      if (currentMonth === 0) {
        setViewYear((year) => year - 1)
        return 11
      }
      return currentMonth - 1
    })
  }, [])

  const goToNextMonth = useCallback(() => {
    setViewMonth((currentMonth) => {
      if (currentMonth === 11) {
        setViewYear((year) => year + 1)
        return 0
      }
      return currentMonth + 1
    })
  }, [])

  const addPersonalCalendar = useCallback((name: string) => {
    const trimmed = name.trim()
    const calendar: UserCalendar = {
      id: crypto.randomUUID(),
      name: trimmed || 'Personal Calendar',
      kind: 'personal',
    }
    setPersonalCalendars((current) => [...current, calendar])
    setActiveCalendarId(calendar.id)
    return calendar
  }, [])

  const createSharedCalendar = useCallback((name: string) => {
    const trimmed = name.trim()
    const calendar: UserCalendar = {
      id: crypto.randomUUID(),
      name: trimmed || 'Shared Calendar',
      kind: 'shared',
      shareCode: generateShareCode(),
    }
    setSharedCalendars((current) => [...current, calendar])
    setActiveCalendarId(calendar.id)
    return calendar
  }, [])

  const joinSharedCalendar = useCallback(
    (rawCode: string) => {
      const shareCode = formatShareCode(rawCode)
      if (shareCode.length < 9) return null

      const existing = sharedCalendars.find((calendar) => calendar.shareCode === shareCode)
      if (existing) {
        setActiveCalendarId(existing.id)
        return existing
      }

      const joined: UserCalendar = {
        id: crypto.randomUUID(),
        name: `Joined ${shareCode}`,
        kind: 'shared',
        shareCode,
      }
      setSharedCalendars((current) => [...current, joined])
      setActiveCalendarId(joined.id)
      return joined
    },
    [sharedCalendars],
  )

  const addEvent = useCallback(
    (title: string, date: string, options?: AddEventOptions) => {
      const trimmed = title.trim()
      if (!trimmed || !date) return null

      const calendarId = options?.calendarId ?? activeCalendarId
      if (!allCalendars.some((item) => item.id === calendarId)) return null

      const targetCalendar = allCalendars.find((item) => item.id === calendarId)
      const sharedVisible =
        targetCalendar?.kind === 'shared'
          ? true
          : (options?.sharedVisible ?? false)

      const event: UserEvent = {
        id: crypto.randomUUID(),
        calendarId,
        title: trimmed,
        date,
        time: options?.time,
        color: options?.color ?? defaultEventColor,
        sharedVisible,
      }

      setEvents((current) => [...current, event])
      goToDate(date)
      return event
    },
    [activeCalendarId, allCalendars, defaultEventColor, goToDate],
  )

  const getEventById = useCallback(
    (eventId: string) => events.find((event) => event.id === eventId),
    [events],
  )

  const updateEvent = useCallback(
    (eventId: string, updates: UpdateEventInput) => {
      const existing = events.find((event) => event.id === eventId)
      if (!existing) return null

      const calendar = allCalendars.find((item) => item.id === existing.calendarId)
      const next: UserEvent = {
        ...existing,
        title: updates.title?.trim() || existing.title,
        date: updates.date || existing.date,
        time: updates.time === undefined ? existing.time : updates.time || undefined,
        color: updates.color ?? existing.color,
        sharedVisible:
          calendar?.kind === 'shared'
            ? true
            : updates.sharedVisible ?? existing.sharedVisible ?? false,
      }

      setEvents((current) => current.map((event) => (event.id === eventId ? next : event)))
      goToDate(next.date)
      return next
    },
    [allCalendars, events, goToDate],
  )

  const deleteEvent = useCallback((eventId: string) => {
    let removed = false
    setEvents((current) => {
      const next = current.filter((event) => event.id !== eventId)
      removed = next.length !== current.length
      return next
    })
    return removed
  }, [])

  const applyAssistantActions = useCallback(
    (actions: CalendarAction[]) => {
      const results: AssistantActionResult[] = []

      for (const action of actions) {
        switch (action.type) {
          case 'create_event': {
            const calendarId = action.calendarId ?? activeCalendarId
            const calendarName =
              allCalendars.find((calendar) => calendar.id === calendarId)?.name ?? 'Calendar'
            const created = addEvent(action.title, action.date, {
              calendarId: action.calendarId,
              time: getOptionalEventTime(action),
              color: action.color !== undefined ? normalizeEventColor(action.color) : undefined,
            })
            if (created) {
              results.push({
                type: 'create_event',
                title: created.title,
                date: created.date,
                time: created.time,
                calendarName,
              })
            }
            break
          }
          case 'switch_calendar': {
            const target = allCalendars.find((calendar) => calendar.id === action.calendarId)
            if (target) {
              setActiveCalendarId(target.id)
              results.push({ type: 'switch_calendar', name: target.name })
            }
            break
          }
          case 'create_shared_calendar': {
            const created = createSharedCalendar(action.name)
            results.push({
              type: 'create_shared_calendar',
              name: created.name,
              shareCode: created.shareCode ?? '',
            })
            break
          }
          case 'join_shared_calendar': {
            const joined = joinSharedCalendar(action.shareCode)
            if (joined) {
              results.push({ type: 'join_shared_calendar', name: joined.name })
            } else {
              results.push({ type: 'error', message: 'Could not join that share code.' })
            }
            break
          }
          case 'go_to_date': {
            goToDate(action.date)
            results.push({ type: 'go_to_date', date: action.date })
            break
          }
        }
      }

      return results
    },
    [activeCalendarId, addEvent, allCalendars, createSharedCalendar, goToDate, joinSharedCalendar],
  )

  const getChatContext = useCallback(
    (): CalendarChatContext => ({
      today: todayIsoDate(),
      viewMonth: viewMonthLabel,
      activeCalendar,
      defaultEventColor,
      personalCalendars,
      sharedCalendars,
      events: events.map((event) => ({
        ...event,
        calendarName:
          allCalendars.find((calendar) => calendar.id === event.calendarId)?.name ??
          'Unknown',
      })),
    }),
    [
      activeCalendar,
      allCalendars,
      defaultEventColor,
      events,
      personalCalendars,
      sharedCalendars,
      viewMonthLabel,
    ],
  )

  return (
    <CalendarsContext.Provider
      value={{
        personalCalendars,
        sharedCalendars,
        allCalendars,
        activeCalendarId,
        activeCalendar,
        events,
        displayEvents,
        activeCalendarEvents: displayEvents,
        viewYear,
        viewMonth,
        viewMonthLabel,
        defaultEventColor,
        setDefaultEventColor,
        setActiveCalendarId,
        goToToday,
        goToPreviousMonth,
        goToNextMonth,
        goToDate,
        addPersonalCalendar,
        createSharedCalendar,
        joinSharedCalendar,
        addEvent,
        updateEvent,
        deleteEvent,
        getEventById,
        setSharedPersonalVisibility,
        getVisiblePersonalOnShared,
        applyAssistantActions,
        getChatContext,
      }}
    >
      {children}
    </CalendarsContext.Provider>
  )
}

export function useCalendars() {
  const context = useContext(CalendarsContext)
  if (!context) {
    throw new Error('useCalendars must be used within CalendarsProvider')
  }
  return context
}
