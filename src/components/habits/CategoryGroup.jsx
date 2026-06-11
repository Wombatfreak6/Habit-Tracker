import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronRight, Plus } from 'lucide-react'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import HabitCard from './HabitCard'
import { useHabitStore } from '../../stores/habitStore'
import { useUiStore } from '../../stores/uiStore'
import { useUserStore } from '../../stores/userStore'

const CATEGORY_COLORS = {
  Health: '#4A7C59',
  Mind: '#7B68A8',
  Work: '#B8860B',
}

const CATEGORY_HAIKU = {
  Health: { jp: '身体は神殿', en: 'The body is a temple' },
  Mind: { jp: '心を静めよ', en: 'Still the mind' },
  Work: { jp: '一歩ずつ', en: 'One step at a time' },
}

function AddHabitInput({ category, onClose }) {
  const [value, setValue] = useState('')
  const addHabit = useHabitStore(s => s.addHabit)
  const session = useUserStore(s => s.session)

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && value.trim()) {
      addHabit(value.trim(), category, session?.user?.id)
      onClose()
    }
    if (e.key === 'Escape') onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="flex items-center gap-2 px-4 py-2 ml-4">
        <div
          className="flex-1 flex items-center"
          style={{
            background: '#0B0B0F',
            border: '1px solid rgba(255,183,213,0.4)',
            borderRadius: '6px',
            padding: '6px 12px',
          }}
        >
          <input
            autoFocus
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={onClose}
            placeholder="Habit name…"
            className="w-full bg-transparent outline-none font-sans text-sm"
            style={{ color: '#F8F7F2' }}
          />
        </div>
      </div>
    </motion.div>
  )
}

export default function CategoryGroup({ category, habits }) {
  const [showAdd, setShowAdd] = useState(false)
  const collapsedCategories = useUiStore(s => s.collapsedCategories)
  const toggleCategory = useUiStore(s => s.toggleCategory)
  const todayCompletions = useHabitStore(s => s.todayCompletions)

  const isCollapsed = collapsedCategories.includes(category)
  const color = CATEGORY_COLORS[category]
  const completedCount = habits.filter(h => todayCompletions.includes(h.id)).length
  const totalCount = habits.length
  const haiku = CATEGORY_HAIKU[category]

  const { setNodeRef } = useDroppable({ id: `droppable-${category}` })

  return (
    <div className="flex flex-col">
      {/* Category header */}
      <button
        onClick={() => toggleCategory(category)}
        className="flex items-center justify-between px-2 py-2 w-full text-left transition-colors rounded-md group"
        style={{
          borderBottom: `1px solid rgba(${hexToRgb(color)}, 0.15)`,
          paddingBottom: '8px',
          marginBottom: '4px',
        }}
        onMouseEnter={e => e.currentTarget.style.background = `rgba(${hexToRgb(color)}, 0.04)`}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        id={`category-${category}`}
      >
        <div className="flex items-center gap-2">
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, flexShrink: 0 }} />
          <span className="font-serif" style={{ fontSize: '13px', color: '#9B98B0' }}>{category}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-sans" style={{ fontSize: '11px', color: '#5A5870' }}>
            {completedCount}/{totalCount}
          </span>
          {isCollapsed ? <ChevronRight size={14} style={{ color: '#5A5870' }} /> : <ChevronDown size={14} style={{ color: '#5A5870' }} />}
        </div>
      </button>

      {/* Habit list */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div ref={setNodeRef} className="flex flex-col gap-1 py-1">
              <SortableContext items={habits.map(h => h.id)} strategy={verticalListSortingStrategy}>
                {habits.length === 0 ? (
                  <div className="flex flex-col items-center py-6 gap-1">
                    <div className="font-serif" style={{ fontSize: '13px', color: '#5A5870' }}>{haiku.jp}</div>
                    <div className="font-sans" style={{ fontSize: '11px', color: '#3A3848' }}>{haiku.en}</div>
                  </div>
                ) : (
                  habits.map(habit => (
                    <HabitCard key={habit.id} habit={habit} />
                  ))
                )}
              </SortableContext>

              {/* Add habit */}
              <AnimatePresence>
                {showAdd && (
                  <AddHabitInput
                    key="add-input"
                    category={category}
                    onClose={() => setShowAdd(false)}
                  />
                )}
              </AnimatePresence>

              {!showAdd && (
                <button
                  onClick={() => setShowAdd(true)}
                  className="flex items-center gap-1 px-4 py-2 font-sans text-sm transition-colors"
                  style={{ color: '#5A5870' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#9B98B0'}
                  onMouseLeave={e => e.currentTarget.style.color = '#5A5870'}
                  id={`add-habit-${category}`}
                >
                  <Plus size={13} />
                  Add habit
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '255,255,255'
}
