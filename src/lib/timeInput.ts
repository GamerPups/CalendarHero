export type Time12Parts = {
  hour12: number
  minute: number
  isPm: boolean
}

export function parseTime24(time?: string): Time12Parts | null {
  if (!time?.trim()) return null

  const match = time.trim().match(/^(\d{1,2}):(\d{2})$/)
  if (!match) return null

  const hours24 = Number(match[1])
  const minute = Number(match[2])
  if (hours24 > 23 || minute > 59) return null

  const isPm = hours24 >= 12
  let hour12 = hours24 % 12
  if (hour12 === 0) hour12 = 12

  return { hour12, minute, isPm }
}

export function formatTime24(parts: Time12Parts): string {
  let hours24 = parts.hour12 % 12
  if (parts.isPm) hours24 += 12
  if (!parts.isPm && parts.hour12 === 12) hours24 = 0

  return `${String(hours24).padStart(2, '0')}:${String(parts.minute).padStart(2, '0')}`
}

export const HOUR_12_OPTIONS = Array.from({ length: 12 }, (_, index) => index + 1)
export const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, index) => index)
