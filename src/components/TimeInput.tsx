import { useEffect, useState } from 'react'
import {
  formatTime24,
  HOUR_12_OPTIONS,
  MINUTE_OPTIONS,
  parseTime24,
  type Time12Parts,
} from '../lib/timeInput'

type TimeInputProps = {
  id?: string
  value?: string
  onChange: (value: string) => void
}

const DEFAULT_PARTS: Time12Parts = { hour12: 9, minute: 0, isPm: false }
export const DEFAULT_TIME = formatTime24(DEFAULT_PARTS)

export function TimeInput({ id, value, onChange }: TimeInputProps) {
  const [parts, setParts] = useState<Time12Parts>(() => parseTime24(value) ?? DEFAULT_PARTS)

  useEffect(() => {
    const parsed = parseTime24(value)
    if (parsed) setParts(parsed)
  }, [value])

  function emit(nextParts: Time12Parts) {
    setParts(nextParts)
    onChange(formatTime24(nextParts))
  }

  return (
    <div className="time-input" id={id}>
      <div className="time-input-row">
        <select
          className="field-input time-field field-input-dark"
          value={parts.hour12}
          onChange={(event) => emit({ ...parts, hour12: Number(event.target.value) })}
          aria-label="Hour"
        >
          {HOUR_12_OPTIONS.map((hour) => (
            <option key={hour} value={hour}>
              {hour}
            </option>
          ))}
        </select>
        <span className="time-separator">:</span>
        <select
          className="field-input time-field field-input-dark"
          value={parts.minute}
          onChange={(event) => emit({ ...parts, minute: Number(event.target.value) })}
          aria-label="Minute"
        >
          {MINUTE_OPTIONS.map((minute) => (
            <option key={minute} value={minute}>
              {String(minute).padStart(2, '0')}
            </option>
          ))}
        </select>
        <label className="ampm-slider" aria-label="AM or PM">
          <span className={`ampm-label${!parts.isPm ? ' active' : ''}`}>AM</span>
          <span className="ampm-switch">
            <input
              type="checkbox"
              checked={parts.isPm}
              onChange={(event) => emit({ ...parts, isPm: event.target.checked })}
            />
            <span className="ampm-track" />
          </span>
          <span className={`ampm-label${parts.isPm ? ' active' : ''}`}>PM</span>
        </label>
      </div>
    </div>
  )
}
