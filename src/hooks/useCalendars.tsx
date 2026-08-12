import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { generateShareCode, formatShareCode } from '../lib/shareCode'
import {
  type EventColor,
  EVENT_COLORS,
  formatMonthTitle,
  parseIsoDate,
  todayIsoDate,
} from '../lib/calendar-utils'
import type { CalendarAction } from '../lib/assistantActions'

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
  color: EventColor
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
}

type CalendarsContextValue = {
  personalCalendars: UserCalendar[]
  sharedCalendars: UserCalendar[]
  allCalendars: UserCalendar[]
  activeCalendarId: string
  activeCalendar: UserCalendar
  events: UserEvent[]
  activeCalendarEvents: UserEvent[]
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
  applyAssistantActions: (actions: CalendarAction[]) => string[]
  getChatContext: () => CalendarChatContext
}

const CalendarsContext = createContext<CalendarsContextValue | null>(null)

const DEFAULT_PERSONAL_CALENDARS: UserCalendar[] = [
  { id: 'personal-default', name: 'My Calendar', kind: 'personal' },
  { id: 'personal-work', name: 'Work', kind: 'personal' },
  { id: 'personal-family', name: 'Family', kind: 'personal' },
]


export function CalendarsProvider({ children }: { children: ReactNode }) {
  const today = todayIsoDate()
  const todayParts = parseIsoDate(today)

  const [personalCalendars, setPersonalCalendars] = useState<UserCalendar[]>(
    DEFAULT_PERSONAL_CALENDARS,
  )
  const [sharedCalendars, setSharedCalendars] = useState<UserCalendar[]>([
    {
      id: 'shared-sample',
      name: 'Sample coders',
      kind: 'shared',
      shareCode: 'H3RO-C0DE',
    },
  ])
  const [activeCalendarId, setActiveCalendarId] = useState(DEFAULT_PERSONAL_CALENDARS[0].id)
  const [events, setEvents] = useState<UserEvent[]>([])
  const [viewYear, setViewYear] = useState(todayParts.year)
  const [viewMonth, setViewMonth] = useState(todayParts.month)
  const [defaultEventColor, setDefaultEventColor] = useState<EventColor>('cyan')

  const allCalendars = useMemo(
    () => [...personalCalendars, ...sharedCalendars],
    [personalCalendars, sharedCalendars],
  )

  const activeCalendar =
    allCalendars.find((calendar) => calendar.id === activeCalendarId) ??
    DEFAULT_PERSONAL_CALENDARS[0]

  const activeCalendarEvents = events.filter(
    (event) => event.calendarId === activeCalendarId,
  )

  const viewMonthLabel = formatMonthTitle(viewYear, viewMonth)

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

      const event: UserEvent = {
        id: crypto.randomUUID(),
        calendarId,
        title: trimmed,
        date,
        color: options?.color ?? defaultEventColor,
      }

      setEvents((current) => [...current, event])
      goToDate(date)
      return event
    },
    [activeCalendarId, allCalendars, defaultEventColor, goToDate],
  )

  const applyAssistantActions = useCallback(
    (actions: CalendarAction[]) => {
      const summaries: string[] = []

      for (const action of actions) {
        switch (action.type) {
          case 'create_event': {
            const created = addEvent(action.title, action.date, {
              calendarId: action.calendarId,
              color: EVENT_COLORS.includes(action.color as EventColor)
                ? (action.color as EventColor)
                : undefined,
            })
            if (created) summaries.push(`Added "${created.title}" on ${created.date}.`)
            break
          }
          case 'switch_calendar': {
            const target = allCalendars.find((calendar) => calendar.id === action.calendarId)
            if (target) {
              setActiveCalendarId(target.id)
              summaries.push(`Switched to ${target.name}.`)
            }
            break
          }
          case 'create_shared_calendar': {
            const created = createSharedCalendar(action.name)
            summaries.push(
              `Created shared calendar "${created.name}" with code ${created.shareCode}.`,
            )
            break
          }
          case 'join_shared_calendar': {
            const joined = joinSharedCalendar(action.shareCode)
            if (joined) {
              summaries.push(`Joined shared calendar "${joined.name}".`)
            } else {
              summaries.push('Could not join that share code.')
            }
            break
          }
          case 'go_to_date': {
            goToDate(action.date)
            summaries.push(`Jumped to ${action.date}.`)
            break
          }
        }
      }

      return summaries
    },
    [addEvent, allCalendars, createSharedCalendar, goToDate, joinSharedCalendar],
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
        activeCalendarEvents,
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
