import { useCalendars } from '../../hooks/useCalendars'
import {
  formatEventTime,
  getEventCategoryMeta,
  getEventColorMeta,
  normalizeEventCategory,
} from '../../lib/calendar-utils'
import { groupEventsForHome } from '../../lib/mobileAgenda'
import type { DisplayEvent } from '../../lib/sharedVisibility'

type MobileHomeProps = {
  onOpenEvent: (event: DisplayEvent, x: number, y: number) => void
  onOpenCalendar: () => void
}

function HomeEventRow({
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
      className="cozi-home-event"
      onClick={(pointerEvent) => onOpenEvent(event, pointerEvent.clientX, pointerEvent.clientY)}
    >
      <span className="cozi-home-event-time">{timeLabel}</span>
      <span className="cozi-home-event-main">
        <span className="cozi-home-event-title">{event.title}</span>
        <span className="cozi-home-event-meta">
          <span className="cozi-category-dot" style={{ background: colorHex }} />
          {categoryMeta.label}
        </span>
      </span>
    </button>
  )
}

export function MobileHome({ onOpenEvent, onOpenCalendar }: MobileHomeProps) {
  const { activeCalendarEvents } = useCalendars()
  const groups = groupEventsForHome(activeCalendarEvents)

  return (
    <div className="cozi-home">
      <section className="cozi-card cozi-card-hero">
        <div className="cozi-card-icon" aria-hidden>
          📅
        </div>
        <div>
          <h2 className="cozi-card-title">Upcoming events</h2>
          <p className="cozi-card-subtitle">From {groups.reduce((sum, group) => sum + group.events.length, 0)} scheduled</p>
        </div>
      </section>

      {groups.map((group) => (
        <section key={group.id} className="cozi-card">
          <h3 className="cozi-section-label">{group.label}</h3>
          {group.events.length === 0 ? (
            <p className="cozi-empty-copy">no events scheduled</p>
          ) : (
            <div className="cozi-home-event-list">
              {group.events.map((event) => (
                <HomeEventRow key={`${event.id}-${event.source}`} event={event} onOpenEvent={onOpenEvent} />
              ))}
            </div>
          )}
        </section>
      ))}

      <button type="button" className="cozi-card cozi-card-action" onClick={onOpenCalendar}>
        <span>Open full calendar</span>
        <span aria-hidden>→</span>
      </button>
    </div>
  )
}
