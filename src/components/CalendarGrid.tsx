import { buildMonthGrid, DAY_LABELS, todayIsoDate } from '../lib/calendar-utils'
import { useCalendars } from '../hooks/useCalendars'
import { CalendarActionBar } from './CalendarModals'

export function CalendarGrid() {
  const {
    activeCalendar,
    activeCalendarEvents,
    viewYear,
    viewMonth,
    viewMonthLabel,
    goToToday,
    goToPreviousMonth,
    goToNextMonth,
    goToDate,
  } = useCalendars()

  const today = todayIsoDate()
  const monthCells = buildMonthGrid(viewYear, viewMonth)

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
        </div>
      </div>

      <CalendarActionBar />

      <div className="calendar-grid-wrapper">
        <div className="calendar-grid">
          {DAY_LABELS.map((label) => (
            <div key={label} className="day-label">
              {label}
            </div>
          ))}

          {monthCells.map((cell) => {
            const eventsForDay = activeCalendarEvents.filter((event) => event.date === cell.date)

            return (
              <button
                key={cell.date}
                type="button"
                className={`day-cell day-cell-button${cell.date === today ? ' day-cell-today' : ''}`}
                onClick={() => goToDate(cell.date)}
              >
                <span className={`day-number${cell.muted ? ' muted' : ''}`}>{cell.day}</span>
                <div className="day-user-events">
                  {eventsForDay.map((event) => (
                    <div key={event.id} className={`day-event-chip ${event.color}`}>
                      {event.title}
                    </div>
                  ))}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
