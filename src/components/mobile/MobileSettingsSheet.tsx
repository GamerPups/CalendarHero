import { useState } from 'react'
import { useCalendars } from '../../hooks/useCalendars'
import {
  EVENT_CATEGORIES,
  EVENT_COLOR_GROUPS,
  getEventCategoryMeta,
  getEventColorMeta,
  type EventCategory,
  type EventColor,
} from '../../lib/calendar-utils'

type MobileSettingsSheetProps = {
  onClose: () => void
}

export function MobileSettingsSheet({ onClose }: MobileSettingsSheetProps) {
  const {
    defaultEventCategory,
    setDefaultEventCategory,
    getCategoryColor,
    setCategoryColor,
  } = useCalendars()
  const [editingCategory, setEditingCategory] = useState<EventCategory | null>(null)

  return (
    <>
      <button type="button" className="m-sheet-backdrop" aria-label="Close" onClick={onClose} />
      <div className="m-sheet cozi-settings-sheet" role="dialog" aria-modal="true" aria-label="Settings">
        <div className="m-sheet-handle" aria-hidden />
        <div className="m-sheet-header">
          <h2 className="m-sheet-title">Settings</h2>
          <button type="button" className="m-sheet-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="m-sheet-body">
          <section className="cozi-settings-section">
            <h3 className="cozi-settings-heading">Default category</h3>
            <p className="cozi-settings-copy">Used for new events when no category is picked.</p>
            <div className="cozi-settings-category-list">
              {EVENT_CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  className={`cozi-settings-row${category.id === defaultEventCategory ? ' active' : ''}`}
                  onClick={() => setDefaultEventCategory(category.id)}
                >
                  <span className="cozi-settings-row-main">
                    <span
                      className="cozi-category-dot"
                      style={{ background: getEventColorMeta(getCategoryColor(category.id)).hex }}
                    />
                    {category.label}
                  </span>
                  {category.id === defaultEventCategory ? <span>Default</span> : null}
                </button>
              ))}
            </div>
          </section>

          <section className="cozi-settings-section">
            <h3 className="cozi-settings-heading">Category colors</h3>
            <p className="cozi-settings-copy">Set the automatic color for each category.</p>
            {EVENT_CATEGORIES.map((category) => (
              <button
                key={category.id}
                type="button"
                className="cozi-settings-row"
                onClick={() => setEditingCategory(category.id)}
              >
                <span className="cozi-settings-row-main">
                  <span
                    className="cozi-category-dot"
                    style={{ background: getEventColorMeta(getCategoryColor(category.id)).hex }}
                  />
                  {category.label}
                </span>
                <span className="cozi-settings-color-label">
                  {getEventColorMeta(getCategoryColor(category.id)).label}
                </span>
              </button>
            ))}
          </section>
        </div>
      </div>

      {editingCategory ? (
        <>
          <button
            type="button"
            className="m-sheet-backdrop"
            aria-label="Close color picker"
            onClick={() => setEditingCategory(null)}
          />
          <div className="m-sheet cozi-settings-sheet" role="dialog" aria-modal="true" aria-label="Pick category color">
            <div className="m-sheet-handle" aria-hidden />
            <div className="m-sheet-header">
              <button type="button" className="m-sheet-back" onClick={() => setEditingCategory(null)}>
                ← Back
              </button>
              <h2 className="m-sheet-title">{getEventCategoryMeta(editingCategory).label}</h2>
              <button type="button" className="m-sheet-close" onClick={onClose} aria-label="Close">
                ×
              </button>
            </div>
            <div className="m-sheet-body">
              {EVENT_COLOR_GROUPS.map((group) => (
                <div key={group.id} className="cozi-color-group">
                  <p className="cozi-color-group-label">{group.label}</p>
                  <div className="cozi-color-group-grid">
                    {group.colors.map((colorId) => {
                      const color = getEventColorMeta(colorId)
                      const selected = getCategoryColor(editingCategory) === colorId
                      return (
                        <button
                          key={colorId}
                          type="button"
                          className={`cozi-color-pick${selected ? ' selected' : ''}`}
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
            </div>
          </div>
        </>
      ) : null}
    </>
  )
}
