import { useEffect } from 'react'
import { useAchievementStore } from '../stores/achievementStore'
import { useHabits } from './useHabits'
import { useMood } from './useMood'
import { useUserStore } from '../stores/userStore'

export const useAchievements = () => {
  const { checkAndUnlock, unlocked, pending, markSeen } = useAchievementStore()
  const { todayCompletions, currentStreak, totalCompleted, completionHistory, allDoneToday } = useHabits()
  const { hasConsecutiveMoodDays } = useMood()
  const { session } = useUserStore()
  const userId = session?.user?.id

  useEffect(() => {
    if (!userId) return

    // first_habit
    if (todayCompletions.length >= 1) {
      checkAndUnlock('first_habit', userId)
    }

    // streak achievements
    if (currentStreak >= 7) checkAndUnlock('streak_7', userId)
    if (currentStreak >= 30) checkAndUnlock('streak_30', userId)
    if (currentStreak >= 100) checkAndUnlock('streak_100', userId)

    // total completions
    if (totalCompleted >= 100) checkAndUnlock('total_100', userId)

    // mood streaks
    if (hasConsecutiveMoodDays(14)) checkAndUnlock('all_moods', userId)

    // time-based: check the latest completion time
    const hour = new Date().getHours()
    if (todayCompletions.length > 0) {
      if (hour >= 23) checkAndUnlock('night_owl', userId)
      if (hour < 6) checkAndUnlock('early_bird', userId)
    }

  }, [todayCompletions.length, currentStreak, totalCompleted, userId])

  return { unlocked, pending, markSeen }
}
