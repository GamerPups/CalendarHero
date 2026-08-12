import { useState } from 'react'
import { useCalendars, type UserCalendar } from '../hooks/useCalendars'

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function PeopleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={`chevron${open ? ' chevron-open' : ''}`}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

type DropdownProps = {
  label: string
  icon: React.ReactNode
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
}

function Dropdown({ label, icon, isOpen, onToggle, children }: DropdownProps) {
  return (
    <div className={`dropdown${isOpen ? ' dropdown-open' : ''}`}>
      <button
        type="button"
        className={`nav-pill${isOpen ? ' nav-pill-open' : ''}`}
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        {icon}
        {label}
        <ChevronDown open={isOpen} />
      </button>
      {isOpen && (
        <>
          <button type="button" className="dropdown-backdrop" onClick={onToggle} aria-label="Close menu" />
          <div className="dropdown-menu" role="menu">
            {children}
          </div>
        </>
      )}
    </div>
  )
}

function CalendarMenuItem({
  calendar,
  isActive,
  onSelect,
}: {
  calendar: UserCalendar
  isActive: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      role="menuitem"
      className={`dropdown-item${isActive ? ' active' : ''}`}
      onClick={onSelect}
    >
      <span className="dropdown-item-main">
        {isActive && <span className="dropdown-check" aria-hidden="true">✓</span>}
        <span>{calendar.name}</span>
      </span>
      {calendar.shareCode ? (
        <span className="dropdown-code">{calendar.shareCode}</span>
      ) : (
        <span className="dropdown-tag">Personal</span>
      )}
    </button>
  )
}

function CalendarSection({
  title,
  calendars,
  emptyMessage,
  activeCalendarId,
  onSelect,
}: {
  title: string
  calendars: UserCalendar[]
  emptyMessage?: string
  activeCalendarId: string
  onSelect: (id: string) => void
}) {
  return (
    <div className="dropdown-section">
      <p className="dropdown-heading">{title}</p>
      {calendars.length === 0 ? (
        <p className="dropdown-empty">{emptyMessage}</p>
      ) : (
        calendars.map((calendar) => (
          <CalendarMenuItem
            key={calendar.id}
            calendar={calendar}
            isActive={calendar.id === activeCalendarId}
            onSelect={() => onSelect(calendar.id)}
          />
        ))
      )}
    </div>
  )
}

export function Header() {
  const {
    personalCalendars,
    sharedCalendars,
    activeCalendarId,
    setActiveCalendarId,
    addPersonalCalendar,
  } = useCalendars()

  const [openMenu, setOpenMenu] = useState<'personal' | 'shared' | null>(null)
  const [newPersonalName, setNewPersonalName] = useState('')

  function selectCalendar(id: string) {
    setActiveCalendarId(id)
    setOpenMenu(null)
  }

  function toggleMenu(menu: 'personal' | 'shared') {
    setOpenMenu((current) => (current === menu ? null : menu))
  }

  function handleAddPersonal() {
    const trimmed = newPersonalName.trim()
    if (!trimmed) return
    addPersonalCalendar(trimmed)
    setNewPersonalName('')
    setOpenMenu(null)
  }

  return (
    <header className="header">
      <div className="logo">CH</div>
      <nav className="header-nav">
        <Dropdown
          label="My Calendars"
          icon={<CalendarIcon />}
          isOpen={openMenu === 'personal'}
          onToggle={() => toggleMenu('personal')}
        >
          <CalendarSection
            title="Personal"
            calendars={personalCalendars}
            activeCalendarId={activeCalendarId}
            onSelect={selectCalendar}
          />
          <div className="dropdown-inline-form">
            <input
              className="dropdown-input"
              type="text"
              value={newPersonalName}
              placeholder="New personal calendar"
              onChange={(event) => setNewPersonalName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleAddPersonal()
              }}
            />
            <button type="button" className="dropdown-add-btn" onClick={handleAddPersonal}>
              Add
            </button>
          </div>
          <CalendarSection
            title="Shared"
            calendars={sharedCalendars}
            emptyMessage="No shared calendars yet."
            activeCalendarId={activeCalendarId}
            onSelect={selectCalendar}
          />
        </Dropdown>

        <Dropdown
          label="Shared"
          icon={<PeopleIcon />}
          isOpen={openMenu === 'shared'}
          onToggle={() => toggleMenu('shared')}
        >
          <CalendarSection
            title="Shared"
            calendars={sharedCalendars}
            emptyMessage="No shared calendars yet. Create one below the month title."
            activeCalendarId={activeCalendarId}
            onSelect={selectCalendar}
          />
          <CalendarSection
            title="Personal"
            calendars={personalCalendars}
            activeCalendarId={activeCalendarId}
            onSelect={selectCalendar}
          />
        </Dropdown>
      </nav>
    </header>
  )
}
