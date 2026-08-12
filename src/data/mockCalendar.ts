export type EventColor = 'cyan' | 'purple' | 'green' | 'blue'

export type CalendarEvent = {
  id: string
  title: string
  color: EventColor
  week: number
  startCol: number
  span: number
  hasPin?: boolean
}

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

export const MOCK_EVENTS: CalendarEvent[] = [
  { id: '1', title: 'Review DuoCal Code Structure', color: 'cyan', week: 0, startCol: 1, span: 4 },
  { id: '2', title: 'Sprint Planning', color: 'purple', week: 1, startCol: 1, span: 3 },
  { id: '3', title: 'Team Sync', color: 'green', week: 1, startCol: 4, span: 1 },
  { id: '4', title: "Malri's Event", color: 'blue', week: 1, startCol: 5, span: 1, hasPin: true },
  { id: '5', title: "Malri's Event", color: 'blue', week: 1, startCol: 6, span: 1 },
  { id: '6', title: 'Sprint Planning', color: 'purple', week: 2, startCol: 1, span: 2 },
  { id: '7', title: 'Team Sync', color: 'green', week: 2, startCol: 3, span: 2 },
  { id: '8', title: "Malri's Event", color: 'blue', week: 2, startCol: 5, span: 2, hasPin: true },
  { id: '9', title: 'Team Sync', color: 'green', week: 3, startCol: 2, span: 2 },
  { id: '10', title: "Malri's Event", color: 'blue', week: 3, startCol: 4, span: 3, hasPin: true },
  { id: '11', title: "Malri's Event", color: 'blue', week: 4, startCol: 2, span: 1 },
  { id: '12', title: 'Team Sync', color: 'cyan', week: 4, startCol: 4, span: 2 },
]

export const CALENDAR_WEEKS: (number | null)[][] = [
  [null, 1, 2, 3, 4, 5, 6],
  [7, 8, 9, 10, 11, 12, 13],
  [14, 15, 16, 17, 18, 19, 20],
  [21, 22, 23, 24, 25, 26, 27],
  [28, 29, 30, 31, 1, 2, 3],
]

export const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
