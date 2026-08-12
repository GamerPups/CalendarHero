import { useEffect, useRef, useState } from 'react'
import { useCalendars, type UserEvent } from '../hooks/useCalendars'
import type { EventCategory, EventColor } from '../lib/calendar-utils'
import {
  getEventColorMeta,
} from '../lib/calendar-utils'
import { CategorySelect } from './CategorySelect'
import { ColorSelect } from './ColorSelect'
import { DEFAULT_TIME, TimeInput } from './TimeInput'

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

export type EventFormModalProps = {
  onClose: () => void
  initialDate?: string
  event?: UserEvent
}

export function EventFormModal({ onClose, initialDate, event }: EventFormModalProps) {
  const {
    activeCalendar,
    addEvent,
    updateEvent,
    deleteEvent,
    defaultEventCategory,
    getCategoryColor,
    allCalendars,
  } = useCalendars()

  const isEditing = Boolean(event)
  const eventCalendar = event
    ? allCalendars.find((calendar) => calendar.id === event.calendarId)
    : activeCalendar
  const isPersonalTarget = eventCalendar?.kind === 'personal'

  const initialCategory = event?.category ?? defaultEventCategory
  const initialColor = event?.color ?? getCategoryColor(initialCategory)

  const [title, setTitle] = useState(event?.title ?? '')
  const [date, setDate] = useState(event?.date ?? initialDate ?? '')
  const [category, setCategory] = useState<EventCategory>(initialCategory)
  const [color, setColor] = useState<EventColor>(initialColor)
  const [useCustomColor, setUseCustomColor] = useState(
    () => isEditing && event ? event.color !== getCategoryColor(initialCategory) : false,
  )
  const [time, setTime] = useState(event?.time ?? DEFAULT_TIME)
  const [sharedVisible, setSharedVisible] = useState(event?.sharedVisible ?? false)

  function handleCategoryChange(nextCategory: EventCategory) {
    setCategory(nextCategory)
    if (!useCustomColor) {
      setColor(getCategoryColor(nextCategory))
    }
  }

  function handleColorChange(nextColor: EventColor) {
    setColor(nextColor)
    setUseCustomColor(nextColor !== getCategoryColor(category))
  }

  function handleUseCustomColorChange(checked: boolean) {
    setUseCustomColor(checked)
    if (!checked) {
      setColor(getCategoryColor(category))
    }
  }

  function handleSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault()

    const resolvedColor = useCustomColor ? color : getCategoryColor(category)

    if (isEditing && event) {
      updateEvent(event.id, {
        title,
        date,
        time,
        category,
        color: resolvedColor,
        sharedVisible: isPersonalTarget ? sharedVisible : undefined,
      })
    } else {
      addEvent(title, date, {
        category,
        color: resolvedColor,
        time,
        sharedVisible: activeCalendar.kind === 'personal' ? sharedVisible : true,
      })
    }

    onClose()
  }

  function handleDelete() {
    if (!event) return
    deleteEvent(event.id)
    onClose()
  }

  const autoColor = getCategoryColor(category)

  return (
    <Modal title={isEditing ? 'Edit event' : 'Add event'} onClose={onClose}>
      <p className="modal-subtitle">
        {isEditing ? 'Editing on' : 'Adding to'} <strong>{eventCalendar?.name ?? activeCalendar.name}</strong>
        {eventCalendar?.shareCode && (
          <>
            {' '}
            · <code className="share-code">{eventCalendar.shareCode}</code>
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
          onChange={(formEvent) => setTitle(formEvent.target.value)}
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
          onChange={(formEvent) => setDate(formEvent.target.value)}
        />
        <label className="field-label" htmlFor="event-time">
          Time
        </label>
        <TimeInput id="event-time" value={time} onChange={setTime} />
        <label className="field-label" htmlFor="event-category">
          Category
        </label>
        <CategorySelect id="event-category" value={category} onChange={handleCategoryChange} />
        <p className="field-hint">
          {useCustomColor
            ? 'Using a custom color for this event.'
            : `Color is set automatically from category (${getEventColorMeta(autoColor).label}).`}
        </p>
        <label className="picker-option event-color-toggle">
          <input
            type="checkbox"
            checked={useCustomColor}
            onChange={(formEvent) => handleUseCustomColorChange(formEvent.target.checked)}
          />
          <span>Choose a custom color</span>
        </label>
        {useCustomColor ? (
          <>
            <label className="field-label" htmlFor="event-color">
              Color
            </label>
            <ColorSelect id="event-color" value={color} onChange={handleColorChange} />
          </>
        ) : null}
        {(isPersonalTarget || activeCalendar.kind === 'personal') && !isEditing ? (
          <label className="picker-option event-share-toggle">
            <input
              type="checkbox"
              checked={sharedVisible}
              onChange={(formEvent) => setSharedVisible(formEvent.target.checked)}
            />
            <span>
              <strong>Share with group calendars</strong>
              <span className="modal-hint block-hint">
                When enabled, this event can appear on shared calendars you allow. Keep off to stay
                private.
              </span>
            </span>
          </label>
        ) : null}
        {isEditing && isPersonalTarget ? (
          <label className="picker-option event-share-toggle">
            <input
              type="checkbox"
              checked={sharedVisible}
              onChange={(formEvent) => setSharedVisible(formEvent.target.checked)}
            />
            <span>
              <strong>Share with group calendars</strong>
              <span className="modal-hint block-hint">
                {sharedVisible
                  ? 'Visible to shared calendars that include this personal calendar.'
                  : 'Private — only visible on your personal calendar.'}
              </span>
            </span>
          </label>
        ) : null}
        <div className="modal-actions-split">
          {isEditing ? (
            <button type="button" className="btn-danger" onClick={handleDelete}>
              Delete
            </button>
          ) : (
            <span />
          )}
          <div className="modal-actions-right">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={!title.trim() || !date}>
              {isEditing ? 'Save changes' : 'Add event'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
