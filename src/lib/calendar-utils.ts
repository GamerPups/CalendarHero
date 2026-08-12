export type EventColor = 'cyan' | 'purple' | 'green' | 'blue'

export const EVENT_COLORS: EventColor[] = ['cyan', 'purple', 'green', 'blue']

export const SWATCH_COLORS = [
  '#00d4ee',
  '#a855f7',
  '#22c55e',
  '#3b82f6',
  '#f59e0b',
  '#ef4444',
  '#ec4899',
  '#14b8a6',
  '#8b5cf6',
  '#06b6d4',
  '#84cc16',
  '#6366f1',
]

export const SWATCH_TO_EVENT_COLOR: EventColor[] = [
  'cyan',
  'purple',
  'green',
  'blue',
  'cyan',
  'purple',
  'green',
  'blue',
  'purple',
  'cyan',
  'green',
  'blue',
]

export const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

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
