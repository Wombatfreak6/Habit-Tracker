import { useMoodStore } from '../stores/moodStore'
import { todayKey } from '../lib/dateHelpers'

export const useMood = () => {
  const store = useMoodStore()
  const today = todayKey()

  const isTodaySet = store.todayMood !== null
  const historyWithToday = {
    ...store.history,
    ...(store.todayMood ? { [today]: store.todayMood } : {})
  }

  // Check if mood has been logged every day for N consecutive days
  const hasConsecutiveMoodDays = (days) => {
    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const key = date.toISOString().split('T')[0]
      if (!historyWithToday[key]) return false
    }
    return true
  }

  return {
    todayMood: store.todayMood,
    history: historyWithToday,
    isTodaySet,
    isDayLocked: store.isDayLocked,
    setTodayMood: store.setTodayMood,
    loadHistory: store.loadHistory,
    hasConsecutiveMoodDays,
  }
}
