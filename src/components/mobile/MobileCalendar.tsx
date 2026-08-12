import {
  buildMonthGrid,
  DAY_LABELS_SHORT,
  formatEventDateLabel,
  formatEventTime,
  getEventColorMeta,
  todayIsoDate,
} from '../../lib/calendar-utils'
import type { DisplayEvent } from '../../lib/sharedVisibility'
import { useCalendars } from '../../hooks/useCalendars'

type MobileMonthGridProps = {
  selectedDate: string
  onSelectDate: (date: string) => void
}

export function MobileMonthGrid({ selectedDate, onSelectDate }: MobileMonthGridProps) {
  const { activeCalendarEvents, viewYear, viewMonth, goToDate } = useCalendars()
  const today = todayIsoDate()
  const monthCells = buildMonthGrid(viewYear, viewMonth)

  function handleSelect(date: string) {
    goToDate(date)
    onSelectDate(date)
  }

  return (
    <section className="m-month" aria-label="Month calendar">
      <div className="m-month-weekdays">
        {DAY_LABELS_SHORT.map((label, index) => (
          <span key={`${label}-${index}`} className="m-weekday">
            {label}
          </span>
        ))}
      </div>
      <div className="m-month-grid">
        {monthCells.map((cell) => {
          const dayEvents = activeCalendarEvents.filter((event) => event.date === cell.date)
          const isToday = cell.date === today
          const isSelected = cell.date === selectedDate

          return (
            <button
              key={cell.date}
              type="button"
              className={`m-day${cell.muted ? ' m-day-muted' : ''}${isToday ? ' m-day-today' : ''}${isSelected ? ' m-day-selected' : ''}`}
              onClick={() => handleSelect(cell.date)}
              aria-current={isSelected ? 'date' : undefined}
              aria-label={`${cell.day}${dayEvents.length ? `, ${dayEvents.length} events` : ''}`}
            >
              <span className="m-day-number">{cell.day}</span>
              {dayEvents.length > 0 ? (
                <span className="m-day-dots" aria-hidden>
                  {dayEvents.slice(0, 4).map((event) => (
                    <span
                      key={`${event.id}-${event.source}`}
                      className="m-day-dot"
                      style={{ background: getEventColorMeta(event.color).hex }}
                    />
                  ))}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>
    </section>
  )
}

type MobileDayAgendaProps = {
  date: string
  onAddEvent: () => void
  onOpenEvent: (event: DisplayEvent, x: number, y: number) => void
}

function AgendaEventRow({
  event,
  isPersonalView,
  onOpenEvent,
}: {
  event: DisplayEvent
  isPersonalView: boolean
  onOpenEvent: (event: DisplayEvent, x: number, y: number) => void
}) {
  const color = getEventColorMeta(event.color)
  const timeLabel = formatEventTime(event.time)
  const isPrivate = isPersonalView && event.source === 'native' && !event.sharedVisible

  return (
    <button
      type="button"
      className="m-agenda-item"
      onClick={(pointerEvent) => onOpenEvent(event, pointerEvent.clientX, pointerEvent.clientY)}
    >
      <span className="m-agenda-accent" style={{ background: color.hex }} />
      <span className="m-agenda-body">
        <span className="m-agenda-title-row">
          <span className="m-agenda-title">{event.title}</span>
          {isPrivate ? <span className="m-agenda-lock">Private</span> : null}
        </span>
        <span className="m-agenda-meta">
          {timeLabel ?? 'All day'}
          {event.source === 'personal' && event.sourceCalendarName
            ? ` · ${event.sourceCalendarName}`
            : ''}
        </span>
      </span>
    </button>
  )
}

export function MobileDayAgenda({ date, onAddEvent, onOpenEvent }: MobileDayAgendaProps) {
  const { activeCalendar, activeCalendarEvents } = useCalendars()
  const dayEvents = activeCalendarEvents
    .filter((event) => event.date === date)
    .sort((left, right) => (left.time ?? '').localeCompare(right.time ?? ''))

  return (
    <section className="m-agenda" aria-label="Day schedule">
      <div className="m-agenda-header">
        <div>
          <h2 className="m-agenda-date">{formatEventDateLabel(date)}</h2>
          <p className="m-agenda-subtitle">
            {dayEvents.length === 0
              ? 'No events scheduled'
              : `${dayEvents.length} event${dayEvents.length === 1 ? '' : 's'}`}
          </p>
        </div>
        <button type="button" className="m-agenda-add" onClick={onAddEvent}>
          + Add
        </button>
      </div>

      {dayEvents.length === 0 ? (
        <div className="m-agenda-empty">
          <p>Tap a day on the calendar, then add something here.</p>
        </div>
      ) : (
        <div className="m-agenda-list">
          {dayEvents.map((event) => (
            <AgendaEventRow
              key={`${event.id}-${event.source}`}
              event={event}
              isPersonalView={activeCalendar.kind === 'personal'}
              onOpenEvent={onOpenEvent}
            />
          ))}
        </div>
      )}
    </section>
  )
}
