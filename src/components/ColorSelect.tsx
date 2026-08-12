import { useEffect, useRef, useState } from 'react'
import type { EventColor } from '../lib/calendar-utils'
import { EVENT_COLOR_GROUPS, getEventColorMeta } from '../lib/calendar-utils'

type ColorSelectProps = {
  id?: string
  value: EventColor
  onChange: (color: EventColor) => void
  hint?: string
}

export function ColorSelect({ id, value, onChange, hint }: ColorSelectProps) {
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
      {hint ? <p className="field-hint">{hint}</p> : null}
      {open ? (
        <ul className="color-select-menu color-select-menu-grouped" role="listbox" aria-label="Event color">
          {EVENT_COLOR_GROUPS.map((group) => (
            <li key={group.id} className="color-select-group">
              <p className="color-select-group-label">{group.label}</p>
              <ul className="color-select-group-list">
                {group.colors.map((optionId) => {
                  const option = getEventColorMeta(optionId)
                  return (
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
                  )
                })}
              </ul>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
