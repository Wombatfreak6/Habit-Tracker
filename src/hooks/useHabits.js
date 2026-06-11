import { useHabitStore } from '../stores/habitStore'
import { todayKey } from '../lib/dateHelpers'
import { calculateCurrentStreak, calculateLongestStreak, calculateWeeklyPercent, calculateTotalCompleted } from '../lib/streakUtils'

export const useHabits = () => {
  const store = useHabitStore()

  const habitsByCategory = store.getHabitsByCategory()
  const ratio = store.getHabitCompletionRatio()
  const today = todayKey()

  const totalHabits = store.habits.length
  const completedToday = store.todayCompletions.length
  const allDoneToday = totalHabits > 0 && completedToday >= totalHabits

  const currentStreak = calculateCurrentStreak(store.completionHistory)
  const longestStreak = calculateLongestStreak(store.completionHistory)
  const weeklyPercent = calculateWeeklyPercent(store.completionHistory)
  const totalCompleted = calculateTotalCompleted(store.completionHistory)

  return {
    habits: store.habits,
    habitsByCategory,
    todayCompletions: store.todayCompletions,
    completionHistory: store.completionHistory,
    ratio,
    totalHabits,
    completedToday,
    allDoneToday,
    currentStreak,
    longestStreak,
    weeklyPercent,
    totalCompleted,
    // Actions
    addHabit: store.addHabit,
    updateHabit: store.updateHabit,
    deleteHabit: store.deleteHabit,
    toggleCompletion: store.toggleCompletion,
    reorderHabits: store.reorderHabits,
    moveHabitToCategory: store.moveHabitToCategory,
    loadFromSupabase: store.loadFromSupabase,
    subscribeToRealtime: store.subscribeToRealtime,
  }
}
