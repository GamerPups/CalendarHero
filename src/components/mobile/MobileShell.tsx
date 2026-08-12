import { useState } from 'react'
import { HeroAssistant } from '../HeroAssistant'
import { EventFormModal } from '../EventFormModal'
import { EventContextMenu, type EventContextMenuState } from '../EventContextMenu'
import { OnboardingTutorial } from '../OnboardingTutorial'
import { PwaShell } from '../pwa/PwaShell'
import { useCalendars } from '../../hooks/useCalendars'
import { formatMonthTitle, todayIsoDate } from '../../lib/calendar-utils'
import type { DisplayEvent } from '../../lib/sharedVisibility'
import { MobileAgendaCalendar, type CalendarViewMode } from './MobileAgendaCalendar'
import { MobileHome } from './MobileHome'
import { MobileActionsSheet, MobileCalendarSheet } from './MobileSheets'
import { MobileSettingsSheet } from './MobileSettingsSheet'
import '../../styles/mobile.css'

type MobileTab = 'home' | 'calendar'

export function MobileShell() {
  const {
    personalCalendars,
    viewYear,
    viewMonth,
    goToToday,
    getEventById,
    updateEvent,
    deleteEvent,
  } = useCalendars()

  const [mobileTab, setMobileTab] = useState<MobileTab>('home')
  const [calendarView, setCalendarView] = useState<CalendarViewMode>('agenda')
  const [selectedDate, setSelectedDate] = useState(todayIsoDate())
  const [menuOpen, setMenuOpen] = useState(false)
  const [calendarSheetOpen, setCalendarSheetOpen] = useState(false)
  const [actionsSheetOpen, setActionsSheetOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [heroOpen, setHeroOpen] = useState(false)
  const [showEventForm, setShowEventForm] = useState(false)
  const [formInitialDate, setFormInitialDate] = useState<string>()
  const [editingEventId, setEditingEventId] = useState<string | null>(null)
  const [contextMenu, setContextMenu] = useState<EventContextMenuState | null>(null)

  const editingEvent = editingEventId ? getEventById(editingEventId) : undefined
  const personalCalendarIds = new Set(personalCalendars.map((calendar) => calendar.id))
  const monthLabel = formatMonthTitle(viewYear, viewMonth)

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

  function handleToday() {
    goToToday()
    setSelectedDate(todayIsoDate())
  }

  const headerTitle = mobileTab === 'home' ? 'CalendarHero Home' : monthLabel

  return (
    <div className="app app-mobile cozi-mobile">
      <PwaShell />
      <OnboardingTutorial />

      <header className="cozi-header">
        <button
          type="button"
          className="cozi-header-btn"
          aria-label="Menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          ☰
        </button>
        <button
          type="button"
          className="cozi-header-title"
          onClick={() => mobileTab === 'calendar' && setCalendarSheetOpen(true)}
        >
          {headerTitle}
          {mobileTab === 'calendar' ? <span className="cozi-header-caret">▾</span> : null}
        </button>
        <div className="cozi-header-actions">
          {mobileTab === 'calendar' ? (
            <>
              <button type="button" className="cozi-header-btn" aria-label="Today" onClick={handleToday}>
                {new Date().getDate()}
              </button>
              <button
                type="button"
                className="cozi-header-btn"
                aria-label="Switch calendar"
                onClick={() => setCalendarSheetOpen(true)}
              >
                👥
              </button>
            </>
          ) : (
            <button
              type="button"
              className="cozi-header-btn"
              aria-label="Settings"
              onClick={() => setSettingsOpen(true)}
            >
              ⚙
            </button>
          )}
        </div>
      </header>

      {menuOpen ? (
        <div className="cozi-menu">
          <button type="button" onClick={() => { setSettingsOpen(true); setMenuOpen(false) }}>Settings</button>
          <button type="button" onClick={() => { setCalendarSheetOpen(true); setMenuOpen(false) }}>Calendars</button>
          <button type="button" onClick={() => { setActionsSheetOpen(true); setMenuOpen(false) }}>More actions</button>
          <button type="button" onClick={() => { setHeroOpen(true); setMenuOpen(false) }}>Hero Assistant</button>
        </div>
      ) : null}

      {mobileTab === 'calendar' ? (
        <div className="cozi-view-tabs" role="tablist" aria-label="Calendar views">
          {(['agenda', '3day', 'month'] as CalendarViewMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              role="tab"
              aria-selected={calendarView === mode}
              className={`cozi-view-tab${calendarView === mode ? ' active' : ''}`}
              onClick={() => setCalendarView(mode)}
            >
              {mode === '3day' ? '3-DAY' : mode.toUpperCase()}
            </button>
          ))}
        </div>
      ) : null}

      <main className="cozi-main">
        {mobileTab === 'home' ? (
          <MobileHome
            onOpenEvent={openEventMenu}
            onOpenCalendar={() => setMobileTab('calendar')}
          />
        ) : (
          <MobileAgendaCalendar
            viewMode={calendarView}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onOpenEvent={openEventMenu}
            onSmartAdd={() => openAddEvent()}
            onAiImport={() => setHeroOpen(true)}
          />
        )}
      </main>

      {mobileTab === 'calendar' ? (
        <button type="button" className="cozi-fab" aria-label="Add event" onClick={() => openAddEvent()}>
          +
        </button>
      ) : null}

      <nav className="cozi-bottom-nav" aria-label="Main">
        <button
          type="button"
          className={`cozi-bottom-item${mobileTab === 'home' ? ' active' : ''}`}
          onClick={() => setMobileTab('home')}
        >
          <span className="cozi-bottom-icon" aria-hidden>⌂</span>
          <span>Home</span>
        </button>
        <button
          type="button"
          className={`cozi-bottom-item${mobileTab === 'calendar' ? ' active' : ''}`}
          onClick={() => setMobileTab('calendar')}
        >
          <span className="cozi-bottom-icon" aria-hidden>▦</span>
          <span>Calendar</span>
        </button>
      </nav>

      {calendarSheetOpen ? <MobileCalendarSheet onClose={() => setCalendarSheetOpen(false)} /> : null}
      {actionsSheetOpen ? (
        <MobileActionsSheet
          onClose={() => setActionsSheetOpen(false)}
          onAddEvent={() => openAddEvent()}
          onOpenSettings={() => setSettingsOpen(true)}
        />
      ) : null}
      {settingsOpen ? <MobileSettingsSheet onClose={() => setSettingsOpen(false)} /> : null}

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
