import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { todayKey } from '../lib/dateHelpers'

export const useMoodStore = create((set, get) => ({
  todayMood: null,   // 1-5 (1=Storm, 5=Fuji Sunrise)
  history: {},       // { "YYYY-MM-DD": moodLevel }

  setTodayMood: async (moodLevel, userId) => {
    const today = todayKey()

    // Optimistic update
    set(state => ({
      todayMood: moodLevel,
      history: { ...state.history, [today]: moodLevel }
    }))

    // Upsert to Supabase (one mood per day)
    await supabase
      .from('mood_logs')
      .upsert(
        { user_id: userId, mood_level: moodLevel, date: today, created_at: new Date().toISOString() },
        { onConflict: 'user_id,date' }
      )
  },

  loadHistory: async (userId) => {
    if (!userId) return

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    const { data } = await supabase
      .from('mood_logs')
      .select('mood_level, date')
      .eq('user_id', userId)
      .gte('date', thirtyDaysAgo)
      .order('date', { ascending: true })

    if (data) {
      const history = {}
      data.forEach(row => { history[row.date] = row.mood_level })
      const today = todayKey()
      set({
        history,
        todayMood: history[today] || null
      })
    }
  },

  isTodayLocked: () => {
    // Today's mood is never locked — only historical moods are read-only
    return false
  },

  isDayLocked: (dateKey) => {
    return dateKey !== todayKey()
  },
}))

export const MOODS = [
  { level: 1, kanji: '嵐', romaji: 'Arashi', english: 'Storm' },
  { level: 2, kanji: '雨', romaji: 'Ame', english: 'Rain' },
  { level: 3, kanji: '曇り', romaji: 'Kumori', english: 'Cloudy' },
  { level: 4, kanji: '晴れ', romaji: 'Hare', english: 'Sunny' },
  { level: 5, kanji: '富士山', romaji: 'Fuji', english: 'Fuji Sunrise' },
]
