import { useEffect, useRef, useState } from 'react'
import type { EventColor } from '../lib/calendar-utils'
import { EVENT_COLOR_PALETTE, getEventColorMeta } from '../lib/calendar-utils'

type ColorSelectProps = {
  id?: string
  value: EventColor
  onChange: (color: EventColor) => void
}

export function ColorSelect({ id, value, onChange }: ColorSelectProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const selected = getEventColorMeta(value)

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
    <div className="color-select" ref={rootRef} id={id}>
      <button
        type="button"
        className="color-select-trigger field-input"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="color-select-swatch" style={{ background: selected.hex }} />
        <span>{selected.label}</span>
        <span className="color-select-chevron">{open ? '▴' : '▾'}</span>
      </button>
      {open ? (
        <ul className="color-select-menu" role="listbox" aria-label="Event color">
          {EVENT_COLOR_PALETTE.map((option) => (
            <li key={option.id} role="option" aria-selected={option.id === value}>
              <button
                type="button"
                className={`color-select-option${option.id === value ? ' selected' : ''}`}
                onClick={() => {
                  onChange(option.id)
                  setOpen(false)
                }}
              >
                <span className="color-select-swatch" style={{ background: option.hex }} />
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
