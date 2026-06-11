import { format, parseISO, startOfDay, subDays, isAfter, isBefore, isSameDay } from 'date-fns'

/**
 * Convert a Date to a consistent "YYYY-MM-DD" string key
 */
export const toDateKey = (date = new Date()) => {
  return format(date, 'yyyy-MM-dd')
}

/**
 * Get today's date key
 */
export const todayKey = () => toDateKey(new Date())

/**
 * Parse a date key back to a Date object (at midnight local time)
 */
export const fromDateKey = (key) => {
  return startOfDay(parseISO(key))
}

/**
 * Get the last N date keys (including today), most recent last
 */
export const getLastNDays = (n) => {
  const days = []
  for (let i = n - 1; i >= 0; i--) {
    days.push(toDateKey(subDays(new Date(), i)))
  }
  return days
}

/**
 * Check if a date key is today
 */
export const isToday = (dateKey) => {
  return dateKey === todayKey()
}

/**
 * Check if a date key is in the past (before today)
 */
export const isPast = (dateKey) => {
  return isBefore(fromDateKey(dateKey), startOfDay(new Date()))
}

/**
 * Format a date key to a human-readable string
 * @param {string} dateKey - "YYYY-MM-DD"
 * @param {string} fmt - date-fns format string
 */
export const formatDateKey = (dateKey, fmt = 'MMM d, yyyy') => {
  return format(fromDateKey(dateKey), fmt)
}

/**
 * Get all day keys for the current month
 */
export const getCurrentMonthDays = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days = []
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(toDateKey(new Date(year, month, d)))
  }
  return days
}

/**
 * Japanese month names
 */
export const JAPANESE_MONTHS = [
  '一月', '二月', '三月', '四月', '五月', '六月',
  '七月', '八月', '九月', '十月', '十一月', '十二月'
]

export const getJapaneseMonth = (date = new Date()) => {
  return JAPANESE_MONTHS[date.getMonth()]
}
