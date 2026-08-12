import { useState } from 'react'
import { useCalendars, type UserCalendar } from '../../hooks/useCalendars'
import { CategorySelect } from '../CategorySelect'
import {
  AddPersonalCalendarModal,
  CreateSharedCalendarModal,
  JoinSharedCalendarModal,
  ShareFromPersonalModal,
} from '../CalendarModals'

type SheetProps = {
  onClose: () => void
}

export function MobileCalendarSheet({ onClose }: SheetProps) {
  const {
    personalCalendars,
    sharedCalendars,
    activeCalendarId,
    activeCalendar,
    setActiveCalendarId,
    addPersonalCalendar,
  } = useCalendars()
  const [newPersonalName, setNewPersonalName] = useState('')

  function selectCalendar(id: string) {
    setActiveCalendarId(id)
    onClose()
  }

  function handleAddPersonal() {
    const trimmed = newPersonalName.trim()
    if (!trimmed) return
    addPersonalCalendar(trimmed)
    setNewPersonalName('')
    onClose()
  }

  return (
    <>
      <button type="button" className="m-sheet-backdrop" aria-label="Close" onClick={onClose} />
      <div className="m-sheet" role="dialog" aria-modal="true" aria-label="Choose calendar">
        <div className="m-sheet-handle" aria-hidden />
        <div className="m-sheet-header">
          <h2 className="m-sheet-title">Calendars</h2>
          <button type="button" className="m-sheet-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="m-sheet-body">
          <CalendarGroup
            title="Personal"
            calendars={personalCalendars}
            activeCalendarId={activeCalendarId}
            onSelect={selectCalendar}
          />
          <CalendarGroup
            title="Shared"
            calendars={sharedCalendars}
            emptyMessage="No shared calendars yet."
            activeCalendarId={activeCalendarId}
            onSelect={selectCalendar}
          />

          <div className="m-sheet-form">
            <input
              className="m-sheet-input"
              type="text"
              value={newPersonalName}
              placeholder="New personal calendar"
              onChange={(event) => setNewPersonalName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleAddPersonal()
              }}
            />
            <button type="button" className="m-sheet-action-primary" onClick={handleAddPersonal}>
              Add
            </button>
          </div>

          {activeCalendar.shareCode ? (
            <p className="m-sheet-footnote">
              Share code: <code>{activeCalendar.shareCode}</code>
            </p>
          ) : null}
        </div>
      </div>
    </>
  )
}

function CalendarGroup({
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
    <div className="m-sheet-group">
      <p className="m-sheet-group-label">{title}</p>
      {calendars.length === 0 ? (
        <p className="m-sheet-empty">{emptyMessage ?? 'None yet.'}</p>
      ) : (
        calendars.map((calendar) => (
          <button
            key={calendar.id}
            type="button"
            className={`m-sheet-row${calendar.id === activeCalendarId ? ' active' : ''}`}
            onClick={() => onSelect(calendar.id)}
          >
            <span>{calendar.name}</span>
            <span className="m-sheet-row-meta">
              {calendar.shareCode ? calendar.shareCode : 'Personal'}
            </span>
          </button>
        ))
      )}
    </div>
  )
}

type MobileActionsSheetProps = SheetProps & {
  onAddEvent: () => void
  onOpenSettings: () => void
}

export function MobileActionsSheet({ onClose, onAddEvent, onOpenSettings }: MobileActionsSheetProps) {
  const { activeCalendar, defaultEventCategory, setDefaultEventCategory } = useCalendars()
  const [showCreateShared, setShowCreateShared] = useState(false)
  const [showJoinShared, setShowJoinShared] = useState(false)
  const [showAddPersonal, setShowAddPersonal] = useState(false)
  const [showShareFromPersonal, setShowShareFromPersonal] = useState(false)
  const [showCategoryDefault, setShowCategoryDefault] = useState(false)

  function runAction(action: () => void) {
    onClose()
    action()
  }

  if (showCategoryDefault) {
    return (
      <>
        <button type="button" className="m-sheet-backdrop" aria-label="Close" onClick={onClose} />
        <div className="m-sheet" role="dialog" aria-modal="true" aria-label="Default category">
          <div className="m-sheet-handle" aria-hidden />
          <div className="m-sheet-header">
            <button type="button" className="m-sheet-back" onClick={() => setShowCategoryDefault(false)}>
              ← Back
            </button>
            <h2 className="m-sheet-title">Default category</h2>
            <button type="button" className="m-sheet-close" onClick={onClose} aria-label="Close">
              ×
            </button>
          </div>
          <div className="m-sheet-body">
            <p className="m-sheet-caption">New events on {activeCalendar.name} use this category and auto color.</p>
            <CategorySelect
              value={defaultEventCategory}
              onChange={(category) => setDefaultEventCategory(category)}
            />
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <button type="button" className="m-sheet-backdrop" aria-label="Close" onClick={onClose} />
      <div className="m-sheet" role="dialog" aria-modal="true" aria-label="Calendar actions">
        <div className="m-sheet-handle" aria-hidden />
        <div className="m-sheet-header">
          <h2 className="m-sheet-title">More</h2>
          <button type="button" className="m-sheet-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="m-sheet-body">
          <button type="button" className="m-sheet-row" onClick={() => runAction(onAddEvent)}>
            <span>Add event</span>
          </button>
          <button
            type="button"
            className="m-sheet-row"
            onClick={() => runAction(() => setShowCreateShared(true))}
          >
            <span>Create shared calendar</span>
          </button>
          <button
            type="button"
            className="m-sheet-row"
            onClick={() => runAction(() => setShowJoinShared(true))}
          >
            <span>Join shared calendar</span>
          </button>
          <button
            type="button"
            className="m-sheet-row"
            onClick={() => runAction(() => setShowAddPersonal(true))}
          >
            <span>Add personal calendar</span>
          </button>
          {activeCalendar.kind === 'shared' ? (
            <button
              type="button"
              className="m-sheet-row"
              onClick={() => runAction(() => setShowShareFromPersonal(true))}
            >
              <span>Show/hide personal events</span>
            </button>
          ) : null}
          <button type="button" className="m-sheet-row" onClick={() => runAction(onOpenSettings)}>
            <span>Settings & category colors</span>
          </button>
        </div>
      </div>

      {showCreateShared ? <CreateSharedCalendarModal onClose={() => setShowCreateShared(false)} /> : null}
      {showJoinShared ? <JoinSharedCalendarModal onClose={() => setShowJoinShared(false)} /> : null}
      {showAddPersonal ? <AddPersonalCalendarModal onClose={() => setShowAddPersonal(false)} /> : null}
      {showShareFromPersonal ? (
        <ShareFromPersonalModal onClose={() => setShowShareFromPersonal(false)} />
      ) : null}
    </>
  )
}
