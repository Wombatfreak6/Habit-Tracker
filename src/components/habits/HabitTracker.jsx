import { useState } from 'react'
import { DndContext, DragOverlay, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { format } from 'date-fns'
import CategoryGroup from './CategoryGroup'
import { useHabitStore, CATEGORIES_LIST } from '../../stores/habitStore'
import { useCulturalFact } from '../../hooks/useCulturalFact'
import CulturalFactCard from '../cultural/CulturalFactCard'
import HabitCard from './HabitCard'

export default function HabitTracker() {
  const [activeId, setActiveId] = useState(null)
  const habits = useHabitStore(s => s.habits)
  const getHabitsByCategory = useHabitStore(s => s.getHabitsByCategory)
  const reorderHabits = useHabitStore(s => s.reorderHabits)
  const moveHabitToCategory = useHabitStore(s => s.moveHabitToCategory)

  const { fact, loading } = useCulturalFact()
  const habitsByCategory = getHabitsByCategory()
  const totalHabits = habits.length

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const activeHabit = activeId ? habits.find(h => h.id === activeId) : null

  const handleDragStart = ({ active }) => setActiveId(active.id)

  const handleDragEnd = ({ active, over }) => {
    setActiveId(null)
    if (!over || active.id === over.id) return

    const activeHabit = habits.find(h => h.id === active.id)
    const overHabit = habits.find(h => h.id === over.id)

    if (!activeHabit) return

    // Check if dropped on a droppable category zone
    if (over.id.startsWith('droppable-')) {
      const newCategory = over.id.replace('droppable-', '')
      if (activeHabit.category !== newCategory) {
        const catHabits = habitsByCategory[newCategory]
        moveHabitToCategory(activeHabit.id, newCategory, catHabits.length)
      }
      return
    }

    // Same-category reorder
    if (overHabit && activeHabit.category === overHabit.category) {
      const catHabits = habitsByCategory[activeHabit.category]
      reorderHabits(catHabits, active.id, over.id)
      return
    }

    // Cross-category drop
    if (overHabit && activeHabit.category !== overHabit.category) {
      const newCatHabits = habitsByCategory[overHabit.category]
      const overIndex = newCatHabits.findIndex(h => h.id === over.id)
      moveHabitToCategory(activeHabit.id, overHabit.category, overIndex)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Section header */}
      <div>
        <div className="font-serif text-xs tracking-widest" style={{ color: '#5A5870', letterSpacing: '0.12em' }}>今日の習慣</div>
        <div className="flex items-baseline gap-3 mt-1">
          <h1 className="font-sans font-light" style={{ fontSize: '22px', color: '#F8F7F2' }}>
            {format(new Date(), 'EEEE, MMMM d')}
          </h1>
        </div>
        <div style={{ height: '1px', background: 'rgba(255,183,213,0.08)', marginTop: '12px' }} />
      </div>

      {/* Cultural Fact Card (when sparse) */}
      {totalHabits <= 5 && <CulturalFactCard fact={fact} loading={loading} />}

      {/* Habit categories with DnD */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-col gap-6">
          {CATEGORIES_LIST.map(cat => (
            <CategoryGroup
              key={cat}
              category={cat}
              habits={habitsByCategory[cat] || []}
            />
          ))}
        </div>

        {/* Drag overlay */}
        <DragOverlay>
          {activeHabit && (
            <div style={{ opacity: 0.85, transform: 'scale(1.03)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
              <HabitCard habit={activeHabit} />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
