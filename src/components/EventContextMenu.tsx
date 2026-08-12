import { useEffect, useRef } from 'react'
import type { DisplayEvent } from '../lib/sharedVisibility'

export type EventContextMenuState = {
  event: DisplayEvent
  x: number
  y: number
}

type EventContextMenuProps = {
  menu: EventContextMenuState
  onClose: () => void
  onEdit: (event: DisplayEvent) => void
  onToggleShare: (event: DisplayEvent) => void
  onDelete: (event: DisplayEvent) => void
  canToggleShare: boolean
}

export function EventContextMenu({
  menu,
  onClose,
  onEdit,
  onToggleShare,
  onDelete,
  canToggleShare,
}: EventContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handlePointerDown(event: MouseEvent | TouchEvent) {
      const target = event.target
      if (menuRef.current && target instanceof Node && !menuRef.current.contains(target)) {
        onClose()
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('mousedown', handlePointerDown)
    window.addEventListener('touchstart', handlePointerDown)
    window.addEventListener('keydown', handleEscape)
    return () => {
      window.removeEventListener('mousedown', handlePointerDown)
      window.removeEventListener('touchstart', handlePointerDown)
      window.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  useEffect(() => {
    const node = menuRef.current
    if (!node) return

    const rect = node.getBoundingClientRect()
    const padding = 12
    let left = menu.x
    let top = menu.y

    if (left + rect.width > window.innerWidth - padding) {
      left = window.innerWidth - rect.width - padding
    }
    if (top + rect.height > window.innerHeight - padding) {
      top = window.innerHeight - rect.height - padding
    }

    node.style.left = `${Math.max(padding, left)}px`
    node.style.top = `${Math.max(padding, top)}px`
  }, [menu.x, menu.y])

  const shareLabel = menu.event.sharedVisible
    ? 'Make private (hide from groups)'
    : 'Share with group calendars'

  return (
    <div
      ref={menuRef}
      className="event-context-menu"
      style={{ left: menu.x, top: menu.y }}
      role="menu"
      aria-label="Event actions"
    >
      <button type="button" className="event-context-item" role="menuitem" onClick={() => onEdit(menu.event)}>
        Edit event
      </button>
      {canToggleShare ? (
        <button
          type="button"
          className="event-context-item"
          role="menuitem"
          onClick={() => onToggleShare(menu.event)}
        >
          {shareLabel}
        </button>
      ) : null}
      <button
        type="button"
        className="event-context-item event-context-item-danger"
        role="menuitem"
        onClick={() => onDelete(menu.event)}
      >
        Delete event
      </button>
    </div>
  )
}

export function useLongPress(onLongPress: () => void, delayMs = 500) {
  const timerRef = useRef<number | null>(null)

  function clearTimer() {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  return {
    onTouchStart: () => {
      clearTimer()
      timerRef.current = window.setTimeout(onLongPress, delayMs)
    },
    onTouchEnd: clearTimer,
    onTouchMove: clearTimer,
    onTouchCancel: clearTimer,
  }
}
