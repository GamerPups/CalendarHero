import { useEffect, useRef, useState } from 'react'
import { useCalendars, type UserCalendar } from '../hooks/useCalendars'
import { formatShareCode } from '../lib/shareCode'
import { EVENT_COLORS, SWATCH_COLORS, SWATCH_TO_EVENT_COLOR } from '../lib/calendar-utils'

type ModalProps = {
  title: string
  onClose: () => void
  children: React.ReactNode
}

function Modal({ title, onClose, children }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    dialogRef.current?.focus()
  }, [])

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function AddEventModal({
  onClose,
  initialDate,
}: {
  onClose: () => void
  initialDate?: string
}) {
  const { addEvent, activeCalendar, defaultEventColor } = useCalendars()
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(initialDate ?? '')
  const [color, setColor] = useState(defaultEventColor)

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    addEvent(title, date, { color })
    onClose()
  }

  return (
    <Modal title="Add event" onClose={onClose}>
      <p className="modal-subtitle">
        Adding to <strong>{activeCalendar.name}</strong>
        {activeCalendar.shareCode && (
          <>
            {' '}
            · <code className="share-code">{activeCalendar.shareCode}</code>
          </>
        )}
      </p>
      <form className="modal-form" onSubmit={handleSubmit}>
        <label className="field-label" htmlFor="event-title">
          Event title
        </label>
        <input
          id="event-title"
          className="field-input"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Team meeting"
          autoFocus
        />
        <label className="field-label" htmlFor="event-date">
          Date
        </label>
        <input
          id="event-date"
          className="field-input"
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />
        <label className="field-label" htmlFor="event-color">
          Color
        </label>
        <select
          id="event-color"
          className="field-input"
          value={color}
          onChange={(event) => setColor(event.target.value as typeof color)}
        >
          {EVENT_COLORS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={!title.trim() || !date}>
            Add event
          </button>
        </div>
      </form>
    </Modal>
  )
}

export function CreateSharedCalendarModal({ onClose }: { onClose: () => void }) {
  const { createSharedCalendar } = useCalendars()
  const [name, setName] = useState('')
  const [created, setCreated] = useState<UserCalendar | null>(null)

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setCreated(createSharedCalendar(name))
  }

  return (
    <Modal title="Create shared calendar" onClose={onClose}>
      {created ? (
        <div className="modal-success">
          <p>
            <strong>{created.name}</strong> is ready to share.
          </p>
          <p className="share-code-label">Share code</p>
          <p className="share-code-display">{created.shareCode}</p>
          <p className="modal-hint">Others can join with this XXXX-XXXX code.</p>
          <div className="modal-actions">
            <button type="button" className="btn-primary" onClick={onClose}>
              Done
            </button>
          </div>
        </div>
      ) : (
        <form className="modal-form" onSubmit={handleSubmit}>
          <p className="modal-subtitle">
            Shared calendars get a unique <strong>XXXX-XXXX</strong> invite code.
          </p>
          <label className="field-label" htmlFor="shared-name">
            Calendar name
          </label>
          <input
            id="shared-name"
            className="field-input"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Family, Roommates, Team…"
            autoFocus
          />
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Create shared calendar
            </button>
          </div>
        </form>
      )}
    </Modal>
  )
}

export function JoinSharedCalendarModal({ onClose }: { onClose: () => void }) {
  const { joinSharedCalendar } = useCalendars()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const joined = joinSharedCalendar(code)
    if (!joined) {
      setError('Enter a valid XXXX-XXXX share code.')
      return
    }
    onClose()
  }

  return (
    <Modal title="Join shared calendar" onClose={onClose}>
      <form className="modal-form" onSubmit={handleSubmit}>
        <p className="modal-subtitle">Enter the XXXX-XXXX code from a shared calendar.</p>
        <label className="field-label" htmlFor="join-code">
          Share code
        </label>
        <input
          id="join-code"
          className="field-input share-code-input"
          type="text"
          value={code}
          onChange={(event) => {
            setCode(formatShareCode(event.target.value))
            setError(null)
          }}
          placeholder="ABCD-1234"
          autoFocus
        />
        {error ? <p className="modal-error">{error}</p> : null}
        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            Join calendar
          </button>
        </div>
      </form>
    </Modal>
  )
}

export function AddPersonalCalendarModal({ onClose }: { onClose: () => void }) {
  const { addPersonalCalendar } = useCalendars()
  const [name, setName] = useState('')

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    addPersonalCalendar(name)
    onClose()
  }

  return (
    <Modal title="Add personal calendar" onClose={onClose}>
      <form className="modal-form" onSubmit={handleSubmit}>
        <label className="field-label" htmlFor="personal-name">
          Calendar name
        </label>
        <input
          id="personal-name"
          className="field-input"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Side projects, Gym…"
          autoFocus
        />
        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            Add calendar
          </button>
        </div>
      </form>
    </Modal>
  )
}

export function CalendarActionBar() {
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [showCreateShared, setShowCreateShared] = useState(false)
  const [showJoinShared, setShowJoinShared] = useState(false)
  const [showAddPersonal, setShowAddPersonal] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)

  return (
    <>
      <div className="calendar-actions">
        <button
          type="button"
          className="action-btn action-btn-primary"
          onClick={() => setShowAddEvent(true)}
        >
          + Add event
        </button>
        <button type="button" className="action-btn" onClick={() => setShowCreateShared(true)}>
          + Create shared calendar
        </button>
        <button type="button" className="action-btn" onClick={() => setShowJoinShared(true)}>
          Join shared calendar
        </button>
        <button type="button" className="action-btn" onClick={() => setShowAddPersonal(true)}>
          + Personal calendar
        </button>
        <button type="button" className="action-btn" onClick={() => setShowColorPicker(true)}>
          Event colors
        </button>
      </div>
      {showAddEvent && <AddEventModal onClose={() => setShowAddEvent(false)} />}
      {showCreateShared && (
        <CreateSharedCalendarModal onClose={() => setShowCreateShared(false)} />
      )}
      {showJoinShared && <JoinSharedCalendarModal onClose={() => setShowJoinShared(false)} />}
      {showAddPersonal && <AddPersonalCalendarModal onClose={() => setShowAddPersonal(false)} />}
      {showColorPicker && (
        <div className="modal-backdrop" onClick={() => setShowColorPicker(false)}>
          <div className="color-popover color-popover-modal" onClick={(e) => e.stopPropagation()}>
            <ColorPickerPopoverInline onClose={() => setShowColorPicker(false)} />
          </div>
        </div>
      )}
    </>
  )
}

function ColorPickerPopoverInline({ onClose }: { onClose: () => void }) {
  const { activeCalendar, defaultEventColor, setDefaultEventColor } = useCalendars()
  const selectedIndex = SWATCH_TO_EVENT_COLOR.indexOf(defaultEventColor)

  return (
    <>
      <div className="color-popover-header">
        <span className="color-popover-title">{activeCalendar.name}</span>
        <button type="button" className="color-popover-close" onClick={onClose}>
          ×
        </button>
      </div>
      <p className="color-popover-subtitle">Default color for new events</p>
      <div className="color-swatches">
        {SWATCH_COLORS.slice(0, 8).map((color, index) => (
          <button
            key={color}
            type="button"
            className={`color-swatch${index === selectedIndex ? ' selected' : ''}`}
            style={{ background: color }}
            onClick={() => setDefaultEventColor(SWATCH_TO_EVENT_COLOR[index])}
          />
        ))}
      </div>
    </>
  )
}
