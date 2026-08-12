export const EVENT_COLOR_PALETTE = [
  { id: 'cyan', label: 'Cyan', hex: '#00d4ee', text: '#7ee8f7' },
  { id: 'sky', label: 'Sky', hex: '#38bdf8', text: '#bae6fd' },
  { id: 'blue', label: 'Blue', hex: '#3b82f6', text: '#93c5fd' },
  { id: 'indigo', label: 'Indigo', hex: '#6366f1', text: '#a5b4fc' },
  { id: 'violet', label: 'Violet', hex: '#8b5cf6', text: '#c4b5fd' },
  { id: 'purple', label: 'Purple', hex: '#a855f7', text: '#d8b4fe' },
  { id: 'fuchsia', label: 'Fuchsia', hex: '#d946ef', text: '#f0abfc' },
  { id: 'pink', label: 'Pink', hex: '#ec4899', text: '#f9a8d4' },
  { id: 'rose', label: 'Rose', hex: '#f43f5e', text: '#fda4af' },
  { id: 'red', label: 'Red', hex: '#ef4444', text: '#fca5a5' },
  { id: 'coral', label: 'Coral', hex: '#fb7185', text: '#fecdd3' },
  { id: 'orange', label: 'Orange', hex: '#f97316', text: '#fdba74' },
  { id: 'amber', label: 'Amber', hex: '#f59e0b', text: '#fcd34d' },
  { id: 'yellow', label: 'Yellow', hex: '#eab308', text: '#fde047' },
  { id: 'lime', label: 'Lime', hex: '#84cc16', text: '#bef264' },
  { id: 'green', label: 'Green', hex: '#22c55e', text: '#86efac' },
  { id: 'emerald', label: 'Emerald', hex: '#10b981', text: '#6ee7b7' },
  { id: 'teal', label: 'Teal', hex: '#14b8a6', text: '#5eead4' },
  { id: 'mint', label: 'Mint', hex: '#2dd4bf', text: '#99f6e4' },
  { id: 'gold', label: 'Gold', hex: '#fbbf24', text: '#fde68a' },
  { id: 'lavender', label: 'Lavender', hex: '#c4b5fd', text: '#ede9fe' },
  { id: 'magenta', label: 'Magenta', hex: '#e879f9', text: '#f5d0fe' },
  { id: 'crimson', label: 'Crimson', hex: '#dc2626', text: '#fca5a5' },
  { id: 'navy', label: 'Navy', hex: '#1d4ed8', text: '#93c5fd' },
] as const

export type EventColor = (typeof EVENT_COLOR_PALETTE)[number]['id']

export const EVENT_COLORS: EventColor[] = EVENT_COLOR_PALETTE.map((color) => color.id)

export const SWATCH_COLORS = EVENT_COLOR_PALETTE.map((color) => color.hex)

export const DEFAULT_EVENT_COLOR: EventColor = 'cyan'

export function isEventColor(value: unknown): value is EventColor {
  return typeof value === 'string' && EVENT_COLORS.includes(value as EventColor)
}

export function normalizeEventColor(value: unknown): EventColor {
  return isEventColor(value) ? value : DEFAULT_EVENT_COLOR
}

export function getEventColorMeta(color: EventColor) {
  return EVENT_COLOR_PALETTE.find((entry) => entry.id === color) ?? EVENT_COLOR_PALETTE[0]
}

export function getEventChipStyle(color: EventColor): {
  background: string
  borderColor: string
  color: string
} {
  const meta = getEventColorMeta(color)
  return {
    background: `${meta.hex}38`,
    borderColor: meta.hex,
    color: meta.text,
  }
}

export const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export const DAY_LABELS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export type MonthCell = {
  date: string
  day: number
  muted: boolean
}

export function buildMonthGrid(year: number, month: number): MonthCell[] {
  const firstOfMonth = new Date(year, month, 1)
  const cursor = new Date(year, month, 1 - firstOfMonth.getDay())
  const cells: MonthCell[] = []

  for (let index = 0; index < 42; index += 1) {
    const cellYear = cursor.getFullYear()
    const cellMonth = cursor.getMonth()
    const day = cursor.getDate()
    cells.push({
      date: toIsoDate(cellYear, cellMonth, day),
      day,
      muted: cellMonth !== month,
    })
    cursor.setDate(cursor.getDate() + 1)
  }

  return cells
}

export function toIsoDate(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function formatMonthTitle(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  })
}

export function parseIsoDate(date: string): { year: number; month: number; day: number } {
  const [year, month, day] = date.split('-').map(Number)
  return { year, month: month - 1, day }
}

export function todayIsoDate(): string {
  const now = new Date()
  return toIsoDate(now.getFullYear(), now.getMonth(), now.getDate())
}

export function isSameMonth(date: string, year: number, month: number): boolean {
  const parsed = parseIsoDate(date)
  return parsed.year === year && parsed.month === month
}

export function formatEventTime(time?: string): string | null {
  if (!time?.trim()) return null

  const match = time.trim().match(/^(\d{1,2}):(\d{2})$/)
  if (!match) return time

  const hours = Number(match[1])
  const minutes = Number(match[2])
  if (hours > 23 || minutes > 59) return time

  const sample = new Date()
  sample.setHours(hours, minutes, 0, 0)
  return sample.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

export function formatEventDateLabel(date: string): string {
  const { year, month, day } = parseIsoDate(date)
  return new Date(year, month, day).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export function formatEventSchedule(date: string, time?: string): string {
  const dateLabel = formatEventDateLabel(date)
  const timeLabel = formatEventTime(time)
  return timeLabel ? `${dateLabel} · ${timeLabel}` : dateLabel
}
