import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronRight } from 'lucide-react'
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
  Mind:   { jp: '心を静めよ', en: 'Still the mind' },
  Work:   { jp: '一歩ずつ', en: 'One step at a time' },
}

function hexToRgb(hex) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return r ? `${parseInt(r[1],16)}, ${parseInt(r[2],16)}, ${parseInt(r[3],16)}` : '255,255,255'
}

function DiamondDivider() {
  return (
    <div
      className="font-sans"
      style={{
        color: '#3A3848',
        fontSize: '7px',
        letterSpacing: '14px',
        textAlign: 'left',
        paddingLeft: '2px',
        paddingTop: '4px',
        paddingBottom: '2px',
        userSelect: 'none',
      }}
      aria-hidden
    >
      ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆
    </div>
  )
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
            placeholder="習慣名…"
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
  const colorRgb = hexToRgb(color)
  const completedCount = habits.filter(h => todayCompletions.includes(h.id)).length
  const totalCount = habits.length
  const isCategoryComplete = totalCount > 0 && completedCount >= totalCount
  const haiku = CATEGORY_HAIKU[category]

  const { setNodeRef } = useDroppable({ id: `droppable-${category}` })

  return (
    <div className="flex flex-col">
      {/* Category header */}
      <button
        onClick={() => toggleCategory(category)}
        className="flex items-center justify-between px-2 py-2 w-full text-left rounded-md"
        style={{ paddingBottom: '8px', marginBottom: '2px' }}
        onMouseEnter={e => e.currentTarget.style.background = `rgba(${colorRgb}, 0.04)`}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        id={`category-${category}`}
      >
        <div className="flex items-center gap-2">
          {/* Pulsing dot — pulses when incomplete */}
          <motion.div
            animate={!isCategoryComplete && totalCount > 0
              ? { scale: [1, 1.15, 1] }
              : { scale: 1 }
            }
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, flexShrink: 0 }}
          />
          <span className="font-serif" style={{ fontSize: '13px', color: '#9B98B0' }}>{category}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-sans" style={{ fontSize: '11px', color: '#5A5870' }}>
            {completedCount}/{totalCount}
          </span>
          {isCollapsed
            ? <ChevronRight size={14} style={{ color: '#5A5870' }} />
            : <ChevronDown size={14} style={{ color: '#5A5870' }} />
          }
        </div>
      </button>

      {/* Diamond divider */}
      <DiamondDivider />

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
                  /* Haiku empty state with tanzaku red line */
                  <div className="flex items-center py-5 gap-3 pl-2">
                    <div style={{ width: '2px', height: '40px', background: '#8B1A1A', borderRadius: '1px', flexShrink: 0 }} />
                    <div className="flex flex-col gap-0.5">
                      <div className="font-serif" style={{ fontSize: '13px', color: '#5A5870' }}>{haiku.jp}</div>
                      <div className="font-sans" style={{ fontSize: '11px', color: '#3A3848' }}>{haiku.en}</div>
                    </div>
                  </div>
                ) : (
                  habits.map(habit => <HabitCard key={habit.id} habit={habit} />)
                )}
              </SortableContext>

              <AnimatePresence>
                {showAdd && (
                  <AddHabitInput key="add-input" category={category} onClose={() => setShowAdd(false)} />
                )}
              </AnimatePresence>

              {!showAdd && (
                <button
                  onClick={() => setShowAdd(true)}
                  className="flex flex-col items-start px-4 pt-2 pb-1 transition-colors"
                  style={{ color: '#5A5870' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#9B98B0'}
                  onMouseLeave={e => e.currentTarget.style.color = '#5A5870'}
                  id={`add-habit-${category}`}
                >
                  <span className="font-serif text-xs">＋ 習慣を追加</span>
                  <span className="font-sans" style={{ fontSize: '10px', color: '#3A3848', marginTop: '1px' }}>Add habit</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
