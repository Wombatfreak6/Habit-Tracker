import { toDateKey, fromDateKey } from './dateHelpers'
import { subDays, startOfMonth, endOfMonth, eachDayOfInterval, format } from 'date-fns'

/**
 * Calculate current streak from completion history
 * completionHistory: { "YYYY-MM-DD": { completed: N, total: N } }
 */
export const calculateCurrentStreak = (completionHistory) => {
  if (!completionHistory || Object.keys(completionHistory).length === 0) return 0

  let streak = 0
  let checkDate = new Date()

  // If today isn't in history yet or has 0 completions, start from yesterday
  const todayKey = toDateKey(checkDate)
  const todayData = completionHistory[todayKey]
  const todayComplete = todayData && todayData.total > 0 && todayData.completed >= todayData.total

  if (!todayComplete) {
    checkDate = subDays(checkDate, 1)
  }

  while (true) {
    const key = toDateKey(checkDate)
    const data = completionHistory[key]
    if (!data || data.total === 0 || data.completed < data.total) break
    streak++
    checkDate = subDays(checkDate, 1)
  }

  return streak
}

/**
 * Calculate longest streak ever from completion history
 */
export const calculateLongestStreak = (completionHistory) => {
  if (!completionHistory || Object.keys(completionHistory).length === 0) return 0

  const sortedKeys = Object.keys(completionHistory).sort()
  let longest = 0
  let current = 0

  for (const key of sortedKeys) {
    const data = completionHistory[key]
    if (data && data.total > 0 && data.completed >= data.total) {
      current++
      if (current > longest) longest = current
    } else {
      current = 0
    }
  }

  return longest
}

/**
 * Calculate weekly completion percentage (last 7 days)
 */
export const calculateWeeklyPercent = (completionHistory) => {
  if (!completionHistory) return 0

  let totalHabits = 0
  let completedHabits = 0

  for (let i = 0; i < 7; i++) {
    const key = toDateKey(subDays(new Date(), i))
    const data = completionHistory[key]
    if (data && data.total > 0) {
      totalHabits += data.total
      completedHabits += data.completed
    }
  }

  if (totalHabits === 0) return 0
  return Math.round((completedHabits / totalHabits) * 100)
}

/**
 * Calculate total completed habits across all history
 */
export const calculateTotalCompleted = (completionHistory) => {
  if (!completionHistory) return 0
  return Object.values(completionHistory).reduce((sum, day) => sum + (day.completed || 0), 0)
}

/**
 * Check if last 7 consecutive days all had 100% completion (perfect week)
 */
export const isPerfectWeek = (completionHistory) => {
  for (let i = 0; i < 7; i++) {
    const key = toDateKey(subDays(new Date(), i))
    const data = completionHistory[key]
    if (!data || data.total === 0 || data.completed < data.total) return false
  }
  return true
}

/**
 * Check if every day this calendar month had 100% completion
 */
export const isPerfectMonth = (completionHistory) => {
  const now = new Date()
  const start = startOfMonth(now)
  const end = new Date(Math.min(endOfMonth(now).getTime(), now.getTime()))
  const days = eachDayOfInterval({ start, end })

  for (const day of days) {
    const key = toDateKey(day)
    const data = completionHistory[key]
    if (!data || data.total === 0 || data.completed < data.total) return false
  }
  return true
}

/**
 * Get daily stats for last N days (for charts)
 */
export const getDailyStats = (completionHistory, days = 14) => {
  return Array.from({ length: days }, (_, i) => {
    const date = subDays(new Date(), days - 1 - i)
    const key = toDateKey(date)
    const data = completionHistory[key] || { completed: 0, total: 0 }
    return {
      date: format(date, 'MMM d'),
      dateKey: key,
      completed: data.completed || 0,
      total: data.total || 0,
      percentage: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
    }
  })
}
