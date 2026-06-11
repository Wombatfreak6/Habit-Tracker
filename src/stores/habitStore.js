import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { toDateKey, todayKey } from '../lib/dateHelpers'

const DEBOUNCE_MS = 500

let debounceTimers = {}
const debounce = (key, fn, ms = DEBOUNCE_MS) => {
  clearTimeout(debounceTimers[key])
  debounceTimers[key] = setTimeout(fn, ms)
}

const CATEGORIES = ['Health', 'Mind', 'Work']

export const useHabitStore = create((set, get) => ({
  habits: [],
  completionHistory: {}, // { "YYYY-MM-DD": { completed: N, total: N } }
  todayCompletions: [],  // habit ids completed today

  loadFromSupabase: async (userId) => {
    if (!userId) return

    // Load habits
    const { data: habits } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .eq('is_archived', false)
      .order('position', { ascending: true })

    // Load today's completions
    const today = todayKey()
    const { data: todayComps } = await supabase
      .from('habit_completions')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)

    // Load last 30 days of completion history
    const thirtyDaysAgo = toDateKey(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
    const { data: historyComps } = await supabase
      .from('habit_completions')
      .select('habit_id, date, completed_at')
      .eq('user_id', userId)
      .gte('date', thirtyDaysAgo)

    // Build completion history
    const completionHistory = {}
    if (historyComps && habits) {
      historyComps.forEach(comp => {
        if (!completionHistory[comp.date]) {
          completionHistory[comp.date] = { completed: 0, total: habits.length }
        }
        completionHistory[comp.date].completed++
      })
      // Fill in days with zero completions
      for (let i = 0; i < 30; i++) {
        const key = toDateKey(new Date(Date.now() - i * 24 * 60 * 60 * 1000))
        if (!completionHistory[key]) {
          completionHistory[key] = { completed: 0, total: habits ? habits.length : 0 }
        }
      }
    }

    set({
      habits: habits || [],
      todayCompletions: todayComps ? todayComps.map(c => c.habit_id) : [],
      completionHistory,
    })
  },

  addHabit: async (name, category, userId) => {
    const { habits } = get()
    const categoryHabits = habits.filter(h => h.category === category)
    const position = categoryHabits.length

    // Optimistic update with temporary ID
    const tempId = `temp-${Date.now()}`
    const newHabit = { id: tempId, name, category, position, user_id: userId, is_archived: false, created_at: new Date().toISOString() }
    set({ habits: [...habits, newHabit] })

    // Persist to Supabase
    const { data, error } = await supabase
      .from('habits')
      .insert({ name, category, position, user_id: userId })
      .select()
      .single()

    if (!error && data) {
      set(state => ({
        habits: state.habits.map(h => h.id === tempId ? data : h)
      }))
    }
  },

  updateHabit: async (id, updates) => {
    // Optimistic update
    set(state => ({
      habits: state.habits.map(h => h.id === id ? { ...h, ...updates } : h)
    }))
    debounce(`update-${id}`, async () => {
      await supabase.from('habits').update(updates).eq('id', id)
    })
  },

  deleteHabit: async (id) => {
    set(state => ({
      habits: state.habits.filter(h => h.id !== id),
      todayCompletions: state.todayCompletions.filter(hId => hId !== id),
    }))
    await supabase.from('habits').update({ is_archived: true }).eq('id', id)
  },

  toggleCompletion: async (habitId, userId) => {
    const { todayCompletions, habits, completionHistory } = get()
    const today = todayKey()
    const isCompleted = todayCompletions.includes(habitId)
    const totalHabits = habits.length

    // Optimistic update
    const newTodayCompletions = isCompleted
      ? todayCompletions.filter(id => id !== habitId)
      : [...todayCompletions, habitId]

    const newCompletedCount = newTodayCompletions.length
    const newHistory = {
      ...completionHistory,
      [today]: { completed: newCompletedCount, total: totalHabits }
    }

    set({ todayCompletions: newTodayCompletions, completionHistory: newHistory })

    // Persist to Supabase
    if (isCompleted) {
      await supabase
        .from('habit_completions')
        .delete()
        .eq('habit_id', habitId)
        .eq('user_id', userId)
        .eq('date', today)
    } else {
      await supabase
        .from('habit_completions')
        .insert({ habit_id: habitId, user_id: userId, date: today, completed_at: new Date().toISOString() })
    }
  },

  reorderHabits: (categoryHabits, activeId, overId) => {
    const { habits } = get()
    const activeIndex = categoryHabits.findIndex(h => h.id === activeId)
    const overIndex = categoryHabits.findIndex(h => h.id === overId)

    if (activeIndex === -1 || overIndex === -1) return

    const reordered = [...categoryHabits]
    const [moved] = reordered.splice(activeIndex, 1)
    reordered.splice(overIndex, 0, moved)

    const updatedPositions = reordered.map((h, i) => ({ ...h, position: i }))
    const updatedHabits = habits.map(h => {
      const updated = updatedPositions.find(u => u.id === h.id)
      return updated || h
    })

    set({ habits: updatedHabits })

    // Debounced persist
    debounce('reorder', async () => {
      for (const h of updatedPositions) {
        await supabase.from('habits').update({ position: h.position }).eq('id', h.id)
      }
    })
  },

  moveHabitToCategory: (habitId, newCategory, newPosition) => {
    const { habits } = get()
    const updatedHabits = habits.map(h =>
      h.id === habitId ? { ...h, category: newCategory, position: newPosition } : h
    )

    // Recompute positions within the new category
    const newCategoryHabits = updatedHabits
      .filter(h => h.category === newCategory)
      .sort((a, b) => a.position - b.position)
      .map((h, i) => ({ ...h, position: i }))

    // Recompute positions within the old category
    const oldHabit = habits.find(h => h.id === habitId)
    const oldCategory = oldHabit?.category
    const oldCategoryHabits = updatedHabits
      .filter(h => h.category === oldCategory && h.id !== habitId)
      .sort((a, b) => a.position - b.position)
      .map((h, i) => ({ ...h, position: i }))

    const finalHabits = habits.map(h => {
      const inNew = newCategoryHabits.find(n => n.id === h.id)
      if (inNew) return inNew
      const inOld = oldCategoryHabits.find(o => o.id === h.id)
      if (inOld) return inOld
      return h
    })

    set({ habits: finalHabits })

    // Debounced Supabase PATCH
    debounce(`move-${habitId}`, async () => {
      await supabase.from('habits').update({ category: newCategory, position: newPosition }).eq('id', habitId)
      for (const h of newCategoryHabits) {
        await supabase.from('habits').update({ position: h.position }).eq('id', h.id)
      }
      for (const h of oldCategoryHabits) {
        await supabase.from('habits').update({ position: h.position }).eq('id', h.id)
      }
    })
  },

  getHabitCompletionRatio: () => {
    const { habits, todayCompletions } = get()
    if (habits.length === 0) return 0
    return todayCompletions.length / habits.length
  },

  getHabitsByCategory: () => {
    const { habits } = get()
    return CATEGORIES.reduce((acc, cat) => {
      acc[cat] = habits
        .filter(h => h.category === cat)
        .sort((a, b) => a.position - b.position)
      return acc
    }, {})
  },

  subscribeToRealtime: (userId) => {
    const channel = supabase
      .channel('habit_completions')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'habit_completions',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        const { todayCompletions } = get()
        if (!todayCompletions.includes(payload.new.habit_id)) {
          set(state => ({
            todayCompletions: [...state.todayCompletions, payload.new.habit_id]
          }))
        }
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'habit_completions',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        set(state => ({
          todayCompletions: state.todayCompletions.filter(id => id !== payload.old.habit_id)
        }))
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  },
}))

export const CATEGORIES_LIST = CATEGORIES
