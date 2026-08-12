import { useEffect, useRef, useState } from 'react'
import type { EventCategory } from '../lib/calendar-utils'
import { EVENT_CATEGORIES, getEventCategoryMeta, getEventColorMeta } from '../lib/calendar-utils'
import { useCalendars } from '../hooks/useCalendars'

type CategorySelectProps = {
  id?: string
  value: EventCategory
  onChange: (category: EventCategory) => void
}

export function CategorySelect({ id, value, onChange }: CategorySelectProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const { getCategoryColor } = useCalendars()
  const selected = getEventCategoryMeta(value)

  useEffect(() => {
    function handlePointerDown(event: MouseEvent | TouchEvent) {
      const target = event.target
      if (rootRef.current && target instanceof Node && !rootRef.current.contains(target)) {
        setOpen(false)
      }
    }

    window.addEventListener('mousedown', handlePointerDown)
    window.addEventListener('touchstart', handlePointerDown)
    return () => {
      window.removeEventListener('mousedown', handlePointerDown)
      window.removeEventListener('touchstart', handlePointerDown)
    }
  }, [])

  return (
    <div className="category-select" ref={rootRef} id={id}>
      <button
        type="button"
        className="category-select-trigger field-input"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span
          className="category-select-swatch"
          style={{ background: getEventColorMeta(getCategoryColor(value)).hex }}
        />
        <span>{selected.label}</span>
        <span className="color-select-chevron">{open ? '▴' : '▾'}</span>
      </button>
      {open ? (
        <ul className="color-select-menu category-select-menu" role="listbox" aria-label="Event category">
          {EVENT_CATEGORIES.map((option) => (
            <li key={option.id} role="option" aria-selected={option.id === value}>
              <button
                type="button"
                className={`color-select-option${option.id === value ? ' selected' : ''}`}
                onClick={() => {
                  onChange(option.id)
                  setOpen(false)
                }}
              >
                <span
                  className="color-select-swatch"
                  style={{ background: getEventColorMeta(getCategoryColor(option.id)).hex }}
                />
                <span className="category-select-option-label">
                  {option.label}
                  <span className="category-select-auto-hint">Auto color</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
