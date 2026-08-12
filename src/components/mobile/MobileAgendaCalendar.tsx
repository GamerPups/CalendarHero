import { useCalendars } from '../../hooks/useCalendars'
import {
  formatAgendaDayHeader,
  formatEventTime,
  getEventCategoryMeta,
  getEventColorMeta,
  normalizeEventCategory,
  todayIsoDate,
} from '../../lib/calendar-utils'
import { buildAgendaDayGroups } from '../../lib/mobileAgenda'
import type { DisplayEvent } from '../../lib/sharedVisibility'
import { MobileMonthGrid } from './MobileCalendar'

export type CalendarViewMode = 'agenda' | '3day' | 'month'

type MobileAgendaCalendarProps = {
  viewMode: CalendarViewMode
  selectedDate: string
  onSelectDate: (date: string) => void
  onOpenEvent: (event: DisplayEvent, x: number, y: number) => void
  onSmartAdd: () => void
  onAiImport: () => void
}

function AgendaEventRow({
  event,
  onOpenEvent,
}: {
  event: DisplayEvent
  onOpenEvent: (event: DisplayEvent, x: number, y: number) => void
}) {
  const { getCategoryColor } = useCalendars()
  const category = normalizeEventCategory(event.category)
  const categoryMeta = getEventCategoryMeta(category)
  const colorHex = getEventColorMeta(event.color ?? getCategoryColor(category)).hex
  const timeLabel = formatEventTime(event.time) ?? 'All Day'

  return (
    <button
      type="button"
      className="cozi-agenda-event"
      onClick={(pointerEvent) => onOpenEvent(event, pointerEvent.clientX, pointerEvent.clientY)}
    >
      <span className="cozi-agenda-event-time">{timeLabel}</span>
      <span className="cozi-agenda-event-body">
        <span className="cozi-agenda-event-title">{event.title}</span>
        <span className="cozi-agenda-event-meta">
          <span className="cozi-category-dot" style={{ background: colorHex }} />
          {categoryMeta.label}
        </span>
      </span>
    </button>
  )
}

export function MobileAgendaCalendar({
  viewMode,
  selectedDate,
  onSelectDate,
  onOpenEvent,
  onSmartAdd,
  onAiImport,
}: MobileAgendaCalendarProps) {
  const { activeCalendarEvents } = useCalendars()
  const today = todayIsoDate()
  const dayCount = viewMode === '3day' ? 3 : 45
  const dayGroups = buildAgendaDayGroups(activeCalendarEvents, today, dayCount)

  return (
    <div className="cozi-calendar">
      <div className="cozi-quick-actions">
        <button type="button" className="cozi-quick-btn" onClick={onSmartAdd}>
          Smart Add
        </button>
        <button type="button" className="cozi-quick-btn" onClick={onAiImport}>
          AI Event Import
        </button>
      </div>

      {viewMode === 'month' ? (
        <div className="cozi-month-wrap">
          <MobileMonthGrid selectedDate={selectedDate} onSelectDate={onSelectDate} />
        </div>
      ) : (
        <div className="cozi-agenda-list">
          {dayGroups.map((group) => {
            const isToday = group.date === today
            return (
              <section
                key={group.date}
                className={`cozi-agenda-day${isToday ? ' cozi-agenda-day-today' : ''}`}
              >
                <header className="cozi-agenda-day-header">
                  {formatAgendaDayHeader(group.date, today)}
                </header>
                {group.events.length === 0 ? (
                  <p className="cozi-empty-copy cozi-agenda-empty">No events</p>
                ) : (
                  group.events.map((event) => (
                    <AgendaEventRow
                      key={`${event.id}-${event.source}`}
                      event={event}
                      onOpenEvent={onOpenEvent}
                    />
                  ))
                )}
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
