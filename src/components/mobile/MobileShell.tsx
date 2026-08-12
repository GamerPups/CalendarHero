import { useState } from 'react'
import { HeroAssistant } from '../HeroAssistant'
import { EventFormModal } from '../EventFormModal'
import { EventContextMenu, type EventContextMenuState } from '../EventContextMenu'
import { OnboardingTutorial } from '../OnboardingTutorial'
import { PwaShell } from '../pwa/PwaShell'
import { useCalendars } from '../../hooks/useCalendars'
import { todayIsoDate } from '../../lib/calendar-utils'
import type { DisplayEvent } from '../../lib/sharedVisibility'
import { MobileDayAgenda, MobileMonthGrid } from './MobileCalendar'
import { MobileActionsSheet, MobileCalendarSheet } from './MobileSheets'

export function MobileShell() {
  const {
    activeCalendar,
    personalCalendars,
    viewMonthLabel,
    goToToday,
    goToPreviousMonth,
    goToNextMonth,
    getEventById,
    updateEvent,
    deleteEvent,
  } = useCalendars()

  const [selectedDate, setSelectedDate] = useState(todayIsoDate())
  const [calendarSheetOpen, setCalendarSheetOpen] = useState(false)
  const [actionsSheetOpen, setActionsSheetOpen] = useState(false)
  const [heroOpen, setHeroOpen] = useState(false)
  const [showEventForm, setShowEventForm] = useState(false)
  const [formInitialDate, setFormInitialDate] = useState<string>()
  const [editingEventId, setEditingEventId] = useState<string | null>(null)
  const [contextMenu, setContextMenu] = useState<EventContextMenuState | null>(null)

  const editingEvent = editingEventId ? getEventById(editingEventId) : undefined
  const personalCalendarIds = new Set(personalCalendars.map((calendar) => calendar.id))

  function openAddEvent(date?: string) {
    setEditingEventId(null)
    setFormInitialDate(date ?? selectedDate)
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

  return (
    <div className="app app-mobile">
      <PwaShell />
      <OnboardingTutorial />

      <header className="m-topbar">
        <div className="m-topbar-main">
          <span className="m-logo">CH</span>
          <button
            type="button"
            className="m-calendar-switch"
            onClick={() => setCalendarSheetOpen(true)}
            aria-haspopup="dialog"
          >
            <span className="m-calendar-switch-name">{activeCalendar.name}</span>
            <span className="m-calendar-switch-kind">
              {activeCalendar.kind === 'personal' ? 'Personal' : 'Shared'}
            </span>
          </button>
          <button type="button" className="m-today-btn" onClick={() => {
            goToToday()
            setSelectedDate(todayIsoDate())
          }}>
            Today
          </button>
        </div>

        <div className="m-month-bar">
          <button type="button" className="m-icon-btn" aria-label="Previous month" onClick={goToPreviousMonth}>
            ‹
          </button>
          <h1 className="m-month-title">{viewMonthLabel}</h1>
          <button type="button" className="m-icon-btn" aria-label="Next month" onClick={goToNextMonth}>
            ›
          </button>
        </div>
      </header>

      <main className="m-content">
        <MobileMonthGrid selectedDate={selectedDate} onSelectDate={setSelectedDate} />
        <MobileDayAgenda
          date={selectedDate}
          onAddEvent={() => openAddEvent(selectedDate)}
          onOpenEvent={openEventMenu}
        />
      </main>

      <nav className="m-tabbar" aria-label="Main">
        <button type="button" className="m-tab m-tab-active" aria-current="page">
          <span className="m-tab-icon" aria-hidden>
            ▦
          </span>
          <span>Calendar</span>
        </button>
        <button type="button" className="m-tab-fab" aria-label="Add event" onClick={() => openAddEvent()}>
          +
        </button>
        <button type="button" className="m-tab" onClick={() => setHeroOpen(true)}>
          <span className="m-tab-icon" aria-hidden>
            ✦
          </span>
          <span>Hero</span>
        </button>
        <button type="button" className="m-tab" onClick={() => setActionsSheetOpen(true)}>
          <span className="m-tab-icon" aria-hidden>
            ⋯
          </span>
          <span>More</span>
        </button>
      </nav>

      {calendarSheetOpen ? <MobileCalendarSheet onClose={() => setCalendarSheetOpen(false)} /> : null}
      {actionsSheetOpen ? (
        <MobileActionsSheet onClose={() => setActionsSheetOpen(false)} onAddEvent={() => openAddEvent()} />
      ) : null}

      {heroOpen ? (
        <>
          <button
            type="button"
            className="hero-backdrop"
            aria-label="Close Hero Assistant"
            onClick={() => setHeroOpen(false)}
          />
          <HeroAssistant onClose={() => setHeroOpen(false)} />
        </>
      ) : null}

      {showEventForm ? (
        <EventFormModal
          onClose={() => {
            setShowEventForm(false)
            setEditingEventId(null)
            setFormInitialDate(undefined)
          }}
          initialDate={formInitialDate}
          event={editingEvent}
        />
      ) : null}

      {contextMenu ? (
        <EventContextMenu
          menu={contextMenu}
          onClose={() => setContextMenu(null)}
          onEdit={openEditEvent}
          onToggleShare={toggleEventShare}
          onDelete={handleDeleteEvent}
          canToggleShare={personalCalendarIds.has(contextMenu.event.calendarId)}
        />
      ) : null}
    </div>
  )
}
