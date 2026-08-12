import {
  CALENDAR_WEEKS,
  DAY_LABELS,
  MOCK_EVENTS,
  type CalendarEvent,
} from '../data/mockCalendar'
import { ColorPickerPopover, MapPinIcon } from './ColorPickerPopover'

function EventBar({ event, colWidth }: { event: CalendarEvent; colWidth: number }) {
  const left = `calc(${event.startCol} * ${colWidth}% + 2px)`
  const width = `calc(${event.span} * ${colWidth}% - 4px)`
  const top = `calc(${(event.week / 5) * 100}% + 32px)`

  return (
    <div
      className={`event-bar ${event.color}`}
      style={{ left, width, top }}
    >
      {event.title}
    </div>
  )
}

function PinLabel({ event, colWidth }: { event: CalendarEvent; colWidth: number }) {
  if (!event.hasPin) return null
  const left = `calc(${event.startCol} * ${colWidth}% + 6px)`
  const top = `calc(${(event.week / 5) * 100}% + 56px)`

  return (
    <div className="event-pin" style={{ position: 'absolute', left, top }}>
      <MapPinIcon />
      Map Pin
    </div>
  )
}

export function CalendarGrid() {
  const colWidth = 100 / 7

  return (
    <div className="calendar-panel">
      <div className="calendar-header">
        <h1 className="calendar-title">August 2026</h1>
        <div className="calendar-nav">
          <button type="button" className="nav-arrow" aria-label="Previous month">
            ‹
          </button>
          <button type="button" className="today-btn">
            Today
          </button>
          <button type="button" className="nav-arrow" aria-label="Next month">
            ›
          </button>
        </div>
      </div>

      <div className="calendar-grid-wrapper">
        <div className="calendar-grid">
          {DAY_LABELS.map((label) => (
            <div key={label} className="day-label">
              {label}
            </div>
          ))}

          {CALENDAR_WEEKS.flat().map((day, index) => (
            <div key={index} className="day-cell">
              {day !== null && (
                <span className={`day-number${day <= 3 && index >= 28 ? ' muted' : ''}`}>
                  {day}
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="events-layer">
          {MOCK_EVENTS.map((event) => (
            <EventBar key={event.id} event={event} colWidth={colWidth} />
          ))}
          {MOCK_EVENTS.filter((e) => e.hasPin).map((event) => (
            <PinLabel key={`pin-${event.id}`} event={event} colWidth={colWidth} />
          ))}
        </div>

        <ColorPickerPopover />
      </div>
    </div>
  )
}
