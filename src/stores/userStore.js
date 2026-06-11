import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useUserStore = create((set) => ({
  session: null,
  profile: null,
  stats: {
    currentStreak: 0,
    longestStreak: 0,
    totalCompleted: 0,
    weeklyPercent: 0,
  },

  setSession: (session) => set({ session }),

  setStats: (stats) => set({ stats }),

  loadStats: async (userId) => {
    if (!userId) return
    const { data } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (data) {
      set({
        stats: {
          currentStreak: data.current_streak || 0,
          longestStreak: data.longest_streak || 0,
          totalCompleted: data.total_completed || 0,
          weeklyPercent: 0, // computed client-side
        }
      })
    }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ session: null, profile: null, stats: { currentStreak: 0, longestStreak: 0, totalCompleted: 0, weeklyPercent: 0 } })
  },
}))
