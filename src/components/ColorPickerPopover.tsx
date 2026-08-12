import { SWATCH_COLORS } from '../data/mockCalendar'

function MapPinIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
    </svg>
  )
}

export function ColorPickerPopover() {
  return (
    <div className="color-popover">
      <div className="color-popover-header">
        <span className="color-popover-title">Sample coders</span>
        <button type="button" className="color-popover-close" aria-label="Close">
          ×
        </button>
      </div>
      <div className="color-swatches">
        {SWATCH_COLORS.map((color, index) => (
          <button
            key={color}
            type="button"
            className={`color-swatch${index === 0 ? ' selected' : ''}${index >= 8 ? ' disabled-swatch' : ''}`}
            style={{ background: color }}
            aria-label={`Color ${color}`}
          />
        ))}
      </div>
      <div className="color-popover-footer">
        <span>Disabled</span>
        <div className="toggle" />
      </div>
    </div>
  )
}

export { MapPinIcon }
