import { useEffect, useRef, useState } from 'react'
import { useCalendars, type UserCalendar } from '../hooks/useCalendars'
import { formatShareCode } from '../lib/shareCode'
import { resolvePersonalSelection } from '../lib/sharedVisibility'
import {
  EVENT_CATEGORIES,
  EVENT_COLOR_GROUPS,
  getEventCategoryMeta,
  getEventColorMeta,
  type EventCategory,
  type EventColor,
} from '../lib/calendar-utils'
import { CategorySelect } from './CategorySelect'

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

function PersonalCalendarPicker({
  personalCalendars,
  selectedIds,
  onChange,
}: {
  personalCalendars: UserCalendar[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
}) {
  const allSelected = selectedIds.includes('__all__')

  function toggleCalendar(calendarId: string) {
    if (allSelected) {
      onChange([calendarId])
      return
    }

    if (selectedIds.includes(calendarId)) {
      onChange(selectedIds.filter((id) => id !== calendarId))
      return
    }

    onChange([...selectedIds, calendarId])
  }

  function toggleAll() {
    onChange(allSelected ? [] : ['__all__'])
  }

  if (personalCalendars.length === 0) {
    return <p className="modal-hint">No personal calendars available.</p>
  }

  return (
    <div className="personal-picker">
      <p className="field-label">Show events from personal calendars on this shared view</p>
      {personalCalendars.length > 1 ? (
        <label className="picker-option">
          <input type="checkbox" checked={allSelected} onChange={toggleAll} />
          <span>All personal calendars</span>
        </label>
      ) : null}
      {personalCalendars.map((calendar) => (
        <label key={calendar.id} className="picker-option">
          <input
            type="checkbox"
            checked={allSelected || selectedIds.includes(calendar.id)}
            disabled={allSelected}
            onChange={() => toggleCalendar(calendar.id)}
          />
          <span>{calendar.name}</span>
        </label>
      ))}
    </div>
  )
}

export function CreateSharedCalendarModal({ onClose }: { onClose: () => void }) {
  const { personalCalendars, createSharedCalendar, setSharedPersonalVisibility } = useCalendars()
  const [name, setName] = useState('')
  const [created, setCreated] = useState<UserCalendar | null>(null)
  const [selectedPersonalIds, setSelectedPersonalIds] = useState<string[]>([])

  function handleCreate(event: React.FormEvent) {
    event.preventDefault()
    const calendar = createSharedCalendar(name)
    const visibleIds = resolvePersonalSelection(personalCalendars, selectedPersonalIds)
    setSharedPersonalVisibility(calendar.id, visibleIds)
    setCreated(calendar)
  }

  function handleSaveVisibility() {
    if (!created) return
    const visibleIds = resolvePersonalSelection(personalCalendars, selectedPersonalIds)
    setSharedPersonalVisibility(created.id, visibleIds)
    onClose()
  }

  if (created) {
    return (
      <Modal title="Shared calendar created" onClose={onClose}>
        <div className="modal-success">
          <p>
            <strong>{created.name}</strong> is a separate shared calendar.
          </p>
          <p className="share-code-label">Share code — copy now</p>
          <p className="share-code-display">{created.shareCode}</p>
          <PersonalCalendarPicker
            personalCalendars={personalCalendars}
            selectedIds={selectedPersonalIds}
            onChange={setSelectedPersonalIds}
          />
          <p className="modal-hint">
            Checked calendars show on this shared view. Unchecked stays private.
          </p>
          <div className="modal-actions">
            <button type="button" className="btn-primary" onClick={handleSaveVisibility}>
              Save &amp; done
            </button>
          </div>
        </div>
      </Modal>
    )
  }

  return (
    <Modal title="Create shared calendar" onClose={onClose}>
      <form className="modal-form" onSubmit={handleCreate}>
        <p className="modal-subtitle">
          Creates a <strong>separate</strong> calendar with its own events and a{' '}
          <strong>XXXX-XXXX</strong> code shown immediately.
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
        {personalCalendars.length > 0 ? (
          <PersonalCalendarPicker
            personalCalendars={personalCalendars}
            selectedIds={selectedPersonalIds}
            onChange={setSelectedPersonalIds}
          />
        ) : null}
        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            Create &amp; show code
          </button>
        </div>
      </form>
    </Modal>
  )
}

export function ShareFromPersonalModal({ onClose }: { onClose: () => void }) {
  const {
    personalCalendars,
    activeCalendar,
    getVisiblePersonalOnShared,
    setSharedPersonalVisibility,
  } = useCalendars()

  const [selectedPersonalIds, setSelectedPersonalIds] = useState<string[]>(() => {
    if (activeCalendar.kind !== 'shared') return []
    const current = getVisiblePersonalOnShared(activeCalendar.id)
    if (current.length === personalCalendars.length && personalCalendars.length > 1) {
      return ['__all__']
    }
    return current
  })

  function handleSave() {
    if (activeCalendar.kind !== 'shared') return
    const visibleIds = resolvePersonalSelection(personalCalendars, selectedPersonalIds)
    setSharedPersonalVisibility(activeCalendar.id, visibleIds)
    onClose()
  }

  if (activeCalendar.kind !== 'shared') {
    return null
  }

  return (
    <Modal title="Show personal events on shared calendar" onClose={onClose}>
      <p className="modal-subtitle">
        Choose which personal calendars appear on <strong>{activeCalendar.name}</strong>.
        {personalCalendars.length > 1
          ? ' Pick one, several, or all.'
          : ' Toggle visibility for your personal calendar.'}
      </p>
      <PersonalCalendarPicker
        personalCalendars={personalCalendars}
        selectedIds={selectedPersonalIds}
        onChange={setSelectedPersonalIds}
      />
      <div className="modal-actions">
        <button type="button" className="btn-secondary" onClick={onClose}>
          Cancel
        </button>
        <button type="button" className="btn-primary" onClick={handleSave}>
          Update visibility
        </button>
      </div>
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

export function CalendarActionBar({ onAddEvent }: { onAddEvent: () => void }) {
  const { activeCalendar } = useCalendars()
  const [showCreateShared, setShowCreateShared] = useState(false)
  const [showJoinShared, setShowJoinShared] = useState(false)
  const [showAddPersonal, setShowAddPersonal] = useState(false)
  const [showShareFromPersonal, setShowShareFromPersonal] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)

  return (
    <>
      <div className="calendar-actions">
        <button type="button" className="action-btn action-btn-primary" onClick={onAddEvent}>
          + Add event
        </button>
        <button type="button" className="action-btn" onClick={() => setShowCreateShared(true)}>
          + Create shared calendar
        </button>
        {activeCalendar.kind === 'shared' ? (
          <button
            type="button"
            className="action-btn"
            onClick={() => setShowShareFromPersonal(true)}
          >
            Show/hide personal events
          </button>
        ) : null}
        <button type="button" className="action-btn" onClick={() => setShowJoinShared(true)}>
          Join shared calendar
        </button>
        <button type="button" className="action-btn" onClick={() => setShowAddPersonal(true)}>
          + Personal calendar
        </button>
        <button type="button" className="action-btn" onClick={() => setShowColorPicker(true)}>
          Settings
        </button>
      </div>
      {showCreateShared && (
        <CreateSharedCalendarModal onClose={() => setShowCreateShared(false)} />
      )}
      {showShareFromPersonal && (
        <ShareFromPersonalModal onClose={() => setShowShareFromPersonal(false)} />
      )}
      {showJoinShared && <JoinSharedCalendarModal onClose={() => setShowJoinShared(false)} />}
      {showAddPersonal && <AddPersonalCalendarModal onClose={() => setShowAddPersonal(false)} />}
      {showColorPicker && (
        <div className="modal-backdrop" onClick={() => setShowColorPicker(false)}>
          <div
            className="color-popover color-popover-modal category-settings-popover"
            onClick={(e) => e.stopPropagation()}
          >
            <CategorySettingsPopover onClose={() => setShowColorPicker(false)} />
          </div>
        </div>
      )}
    </>
  )
}

function CategorySettingsPopover({ onClose }: { onClose: () => void }) {
  const {
    defaultEventCategory,
    setDefaultEventCategory,
    getCategoryColor,
    setCategoryColor,
  } = useCalendars()
  const [editingCategory, setEditingCategory] = useState<EventCategory | null>(null)

  if (editingCategory) {
    const categoryMeta = getEventCategoryMeta(editingCategory)
    const selectedColor = getCategoryColor(editingCategory)

    return (
      <>
        <div className="color-popover-header">
          <button
            type="button"
            className="category-settings-back"
            onClick={() => setEditingCategory(null)}
          >
            ← Back
          </button>
          <span className="color-popover-title">{categoryMeta.label}</span>
          <button type="button" className="color-popover-close" onClick={onClose}>
            ×
          </button>
        </div>
        <p className="color-popover-subtitle">Pick the automatic color for this category.</p>
        {EVENT_COLOR_GROUPS.map((group) => (
          <div key={group.id} className="category-color-group">
            <p className="category-color-group-label">{group.label}</p>
            <div className="color-swatches color-swatches-grid">
              {group.colors.map((colorId) => {
                const color = getEventColorMeta(colorId)
                return (
                  <button
                    key={colorId}
                    type="button"
                    className={`color-swatch${selectedColor === colorId ? ' selected' : ''}`}
                    style={{ background: color.hex }}
                    title={color.label}
                    aria-label={color.label}
                    onClick={() => {
                      setCategoryColor(editingCategory, colorId as EventColor)
                      setEditingCategory(null)
                    }}
                  />
                )
              })}
            </div>
          </div>
        ))}
      </>
    )
  }

  return (
    <>
      <div className="color-popover-header">
        <span className="color-popover-title">Settings</span>
        <button type="button" className="color-popover-close" onClick={onClose}>
          ×
        </button>
      </div>

      <section className="category-settings-section">
        <h3 className="category-settings-heading">Default category</h3>
        <p className="color-popover-subtitle">Used for new events when no category is picked.</p>
        <CategorySelect value={defaultEventCategory} onChange={setDefaultEventCategory} />
      </section>

      <section className="category-settings-section">
        <h3 className="category-settings-heading">Category colors</h3>
        <p className="color-popover-subtitle">Set the automatic color for each category.</p>
        <ul className="category-settings-list">
          {EVENT_CATEGORIES.map((category) => {
            const color = getEventColorMeta(getCategoryColor(category.id))
            return (
              <li key={category.id}>
                <button
                  type="button"
                  className="category-settings-row"
                  onClick={() => setEditingCategory(category.id)}
                >
                  <span className="category-settings-row-main">
                    <span
                      className="default-category-dot"
                      style={{ background: color.hex }}
                    />
                    {category.label}
                  </span>
                  <span className="category-settings-color-label">{color.label}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </section>
    </>
  )
}
