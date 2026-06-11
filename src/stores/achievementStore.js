import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { playAchievement } from '../lib/soundSystem'

export const ACHIEVEMENTS = {
  first_habit: {
    key: 'first_habit',
    name: 'First Blossom',
    description: 'Completed your first habit',
    icon: '🌸',
  },
  streak_7: {
    key: 'streak_7',
    name: 'Week of Discipline',
    description: '7-day streak achieved',
    icon: '🔥',
  },
  streak_30: {
    key: 'streak_30',
    name: 'Month of Devotion',
    description: '30-day streak achieved',
    icon: '⛩️',
  },
  streak_100: {
    key: 'streak_100',
    name: 'Century of Mastery',
    description: '100-day streak achieved',
    icon: '🏯',
  },
  total_100: {
    key: 'total_100',
    name: 'Hundred Petals',
    description: 'Completed 100 habits total',
    icon: '🌺',
  },
  perfect_week: {
    key: 'perfect_week',
    name: 'Perfect Harmony',
    description: '100% completion every day for 7 days',
    icon: '✨',
  },
  perfect_month: {
    key: 'perfect_month',
    name: 'Sakura Season',
    description: '100% completion every day this month',
    icon: '🌸',
  },
  all_moods: {
    key: 'all_moods',
    name: 'Weather Watcher',
    description: 'Logged mood every day for 14 days',
    icon: '🌤️',
  },
  night_owl: {
    key: 'night_owl',
    name: 'Night Owl',
    description: 'Completed a habit after 23:00',
    icon: '🦉',
  },
  early_bird: {
    key: 'early_bird',
    name: 'Early Bird',
    description: 'Completed a habit before 06:00',
    icon: '🌅',
  },
}

export const useAchievementStore = create((set, get) => ({
  unlocked: [],   // array of achievement keys
  pending: [],    // achievements queued for toast display

  loadAchievements: async (userId) => {
    const { data } = await supabase
      .from('achievements')
      .select('achievement_key')
      .eq('user_id', userId)

    if (data) {
      set({ unlocked: data.map(a => a.achievement_key) })
    }
  },

  checkAndUnlock: async (key, userId) => {
    const { unlocked } = get()
    if (unlocked.includes(key)) return

    set(state => ({
      unlocked: [...state.unlocked, key],
      pending: [...state.pending, key],
    }))

    playAchievement()

    await supabase.from('achievements').insert({
      user_id: userId,
      achievement_key: key,
      unlocked_at: new Date().toISOString(),
    })
  },

  markSeen: (key) => {
    set(state => ({
      pending: state.pending.filter(k => k !== key)
    }))
  },
}))
