import { useState } from 'react'
import { buildMonthGrid, DAY_LABELS, formatEventTime, getEventChipStyle, todayIsoDate } from '../lib/calendar-utils'
import type { DisplayEvent } from '../lib/sharedVisibility'
import { useCalendars } from '../hooks/useCalendars'
import { CalendarActionBar } from './CalendarModals'
import { EventContextMenu, useLongPress, type EventContextMenuState } from './EventContextMenu'
import { EventFormModal } from './EventFormModal'

function TodayMarkerIcon() {
  return (
    <svg
      className="today-day-icon"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 2l1.8 5.5L19 9.3l-5.2 1.8L12 16.5 10.2 11 5 9.3l5.2-1.8L12 2z" />
    </svg>
  )
}

function PrivateEventIcon() {
  return (
    <svg className="day-event-private-icon" width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17 9h-1V7a4 4 0 1 0-8 0v2H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2zm-6-2a2 2 0 1 1 4 0v2h-4V7z" />
    </svg>
  )
}

type DayEventChipProps = {
  event: DisplayEvent
  isPersonalCalendarView: boolean
  onOpenMenu: (event: DisplayEvent, x: number, y: number) => void
}

function DayEventChip({ event, isPersonalCalendarView, onOpenMenu }: DayEventChipProps) {
  const timeLabel = formatEventTime(event.time)
  const isPrivate = isPersonalCalendarView && event.source === 'native' && !event.sharedVisible
  const chipStyle = getEventChipStyle(event.color)

  const longPressHandlers = useLongPress(() => {
    const chip = document.querySelector(`[data-event-id="${event.id}"]`)
    const rect = chip?.getBoundingClientRect()
    onOpenMenu(event, rect?.left ?? 24, rect?.bottom ?? 24)
  })

  function openMenu(clientX: number, clientY: number) {
    onOpenMenu(event, clientX, clientY)
  }

  return (
    <div
      data-event-id={event.id}
      className={`day-event-chip${event.source === 'personal' ? ' personal-mirror' : ''}${isPrivate ? ' event-private' : ''}`}
      style={{
        background: chipStyle.background,
        borderColor: chipStyle.borderColor,
        color: chipStyle.color,
        borderWidth: 1,
        borderStyle: isPrivate ? 'dotted' : 'solid',
      }}
      title={
        event.source === 'personal' && event.sourceCalendarName
          ? `From ${event.sourceCalendarName}`
          : isPrivate
            ? 'Private — not shared with groups'
            : undefined
      }
      onClick={(pointerEvent) => pointerEvent.stopPropagation()}
      onContextMenu={(pointerEvent) => {
        pointerEvent.preventDefault()
        pointerEvent.stopPropagation()
        openMenu(pointerEvent.clientX, pointerEvent.clientY)
      }}
      {...longPressHandlers}
    >
      {isPrivate ? <PrivateEventIcon /> : null}
      {timeLabel ? <span className="day-event-time">{timeLabel}</span> : null}
      <span className="day-event-title">{event.title}</span>
    </div>
  )
}

export function CalendarGrid() {
  const {
    activeCalendar,
    personalCalendars,
    activeCalendarEvents,
    viewYear,
    viewMonth,
    viewMonthLabel,
    goToToday,
    goToPreviousMonth,
    goToNextMonth,
    goToDate,
    getEventById,
    updateEvent,
    deleteEvent,
  } = useCalendars()

  const [showEventForm, setShowEventForm] = useState(false)
  const [formInitialDate, setFormInitialDate] = useState<string>()
  const [editingEventId, setEditingEventId] = useState<string | null>(null)
  const [contextMenu, setContextMenu] = useState<EventContextMenuState | null>(null)

  const today = todayIsoDate()
  const monthCells = buildMonthGrid(viewYear, viewMonth)
  const editingEvent = editingEventId ? getEventById(editingEventId) : undefined
  const personalCalendarIds = new Set(personalCalendars.map((calendar) => calendar.id))

  function openAddEvent(date?: string) {
    setEditingEventId(null)
    setFormInitialDate(date)
    setShowEventForm(true)
  }

  function openEditEvent(displayEvent: DisplayEvent) {
    setContextMenu(null)
    setFormInitialDate(undefined)
    setEditingEventId(displayEvent.id)
    setShowEventForm(true)
  }

  function openEventMenu(displayEvent: DisplayEvent, x: number, y: number) {
    setContextMenu({ event: displayEvent, x, y })
  }

  function toggleEventShare(displayEvent: DisplayEvent) {
    updateEvent(displayEvent.id, { sharedVisible: !displayEvent.sharedVisible })
    setContextMenu(null)
  }

  function handleDeleteEvent(displayEvent: DisplayEvent) {
    deleteEvent(displayEvent.id)
    setContextMenu(null)
  }

  function canToggleShare(displayEvent: DisplayEvent) {
    return personalCalendarIds.has(displayEvent.calendarId)
  }

  return (
    <div className="calendar-panel">
      <div className="calendar-header">
        <div className="calendar-header-left">
          <h1 className="calendar-title">{viewMonthLabel}</h1>
          <p className="calendar-active-meta">
            Viewing <strong>{activeCalendar.name}</strong>
            {activeCalendar.kind === 'personal' ? ' · Personal' : ' · Shared'}
            {activeCalendar.shareCode && (
              <>
                {' '}
                · Code: <code className="share-code">{activeCalendar.shareCode}</code>
              </>
            )}
          </p>
        </div>
        <div className="calendar-nav">
          <button
            type="button"
            className="nav-arrow"
            aria-label="Previous month"
            onClick={goToPreviousMonth}
          >
            ‹
          </button>
          <button type="button" className="today-btn" onClick={goToToday}>
            Today
          </button>
          <button
            type="button"
            className="nav-arrow"
            aria-label="Next month"
            onClick={goToNextMonth}
          >
            ›
          </button>
          <button type="button" className="add-event-header-btn" onClick={() => openAddEvent()}>
            + Add event
          </button>
        </div>
      </div>

      <CalendarActionBar onAddEvent={() => openAddEvent()} />

      <div className="calendar-grid-wrapper">
        <div className="calendar-grid">
          {DAY_LABELS.map((label) => (
            <div key={label} className="day-label">
              {label}
            </div>
          ))}

          {monthCells.map((cell) => {
            const eventsForDay = activeCalendarEvents.filter((event) => event.date === cell.date)
            const isToday = cell.date === today

            return (
              <button
                key={cell.date}
                type="button"
                className={`day-cell day-cell-button${isToday ? ' day-cell-today' : ''}`}
                onClick={() => goToDate(cell.date)}
                onDoubleClick={() => openAddEvent(cell.date)}
                aria-current={isToday ? 'date' : undefined}
              >
                <div className="day-number-row">
                  {isToday ? (
                    <span className="today-day-badge" aria-label="Today">
                      <TodayMarkerIcon />
                      <span className="today-day-number">{cell.day}</span>
                    </span>
                  ) : (
                    <span className={`day-number${cell.muted ? ' muted' : ''}`}>{cell.day}</span>
                  )}
                </div>
                <div className="day-user-events">
                  {eventsForDay.map((event) => (
                    <DayEventChip
                      key={`${event.id}-${event.source}`}
                      event={event}
                      isPersonalCalendarView={activeCalendar.kind === 'personal'}
                      onOpenMenu={openEventMenu}
                    />
                  ))}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {showEventForm && (
        <EventFormModal
          onClose={() => {
            setShowEventForm(false)
            setEditingEventId(null)
            setFormInitialDate(undefined)
          }}
          initialDate={formInitialDate}
          event={editingEvent}
        />
      )}

      {contextMenu ? (
        <EventContextMenu
          menu={contextMenu}
          onClose={() => setContextMenu(null)}
          onEdit={openEditEvent}
          onToggleShare={toggleEventShare}
          onDelete={handleDeleteEvent}
          canToggleShare={canToggleShare(contextMenu.event)}
        />
      ) : null}
    </div>
  )
}
