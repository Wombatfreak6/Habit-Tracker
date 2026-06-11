import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Pencil, Trash2, GripVertical } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useHabitStore } from '../../stores/habitStore'
import { useUserStore } from '../../stores/userStore'
import { playHabitCheck, playAllDone } from '../../lib/soundSystem'
import PetalBurst from '../tree/PetalBurst'
import { format } from 'date-fns'

function CustomCheckbox({ checked, onChange, habitId }) {
  const [burstTrigger, setBurstTrigger] = useState(0)
  const [burstOrigin, setBurstOrigin] = useState(null)
  const checkRef = useRef(null)

  const handleClick = (e) => {
    if (!checked) {
      const rect = checkRef.current?.getBoundingClientRect()
      if (rect) {
        setBurstOrigin({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })
        setBurstTrigger(t => t + 1)
      }
    }
    onChange()
  }

  return (
    <>
      <button
        ref={checkRef}
        onClick={handleClick}
        className="flex-shrink-0 flex items-center justify-center transition-all"
        style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          border: checked ? 'none' : '2px solid rgba(255,183,213,0.35)',
          background: checked ? '#FFB7D5' : 'transparent',
          transition: 'all 200ms ease',
        }}
        aria-label={checked ? 'Mark incomplete' : 'Mark complete'}
      >
        {checked && <Check size={11} color="#0B0B0F" strokeWidth={3} />}
      </button>
      <PetalBurst origin={burstOrigin} trigger={burstTrigger} />
    </>
  )
}

export default function HabitCard({ habit, completionTime }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(habit.name)
  const [isHovered, setIsHovered] = useState(false)

  const todayCompletions = useHabitStore(s => s.todayCompletions)
  const toggleCompletion = useHabitStore(s => s.toggleCompletion)
  const updateHabit = useHabitStore(s => s.updateHabit)
  const deleteHabit = useHabitStore(s => s.deleteHabit)
  const habits = useHabitStore(s => s.habits)
  const session = useUserStore(s => s.session)
  const userId = session?.user?.id

  const isCompleted = todayCompletions.includes(habit.id)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: habit.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleToggle = () => {
    if (!userId) return
    toggleCompletion(habit.id, userId)
    if (!isCompleted) {
      playHabitCheck()
      // Check if all done
      const willBeCompleted = todayCompletions.length + 1
      if (willBeCompleted >= habits.length) {
        setTimeout(playAllDone, 300)
      }
    }
  }

  const handleEditSave = () => {
    if (editValue.trim() && editValue.trim() !== habit.name) {
      updateHabit(habit.id, { name: editValue.trim() })
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleEditSave()
    if (e.key === 'Escape') { setEditValue(habit.name); setIsEditing(false) }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="flex items-center gap-3 group"
      role="listitem"
      id={`habit-${habit.id}`}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="flex-shrink-0 cursor-grab active:cursor-grabbing"
        style={{
          color: '#5A5870',
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 150ms',
          width: '16px',
        }}
      >
        <GripVertical size={14} />
      </div>

      {/* Card */}
      <div
        className="flex items-center gap-3 flex-1 min-w-0 px-4 py-3"
        style={{
          background: '#12121A',
          border: '1px solid rgba(255,183,213,0.06)',
          borderRadius: '8px',
          transition: 'border-color 150ms',
          borderColor: isHovered ? 'rgba(255,183,213,0.12)' : 'rgba(255,183,213,0.06)',
        }}
      >
        <CustomCheckbox checked={isCompleted} onChange={handleToggle} habitId={habit.id} />

        {/* Name */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              autoFocus
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              onBlur={handleEditSave}
              onKeyDown={handleKeyDown}
              className="w-full font-sans text-sm bg-transparent outline-none"
              style={{
                color: '#F8F7F2',
                borderBottom: '1px solid rgba(255,183,213,0.4)',
                paddingBottom: '2px',
              }}
            />
          ) : (
            <motion.span
              animate={{
                color: isCompleted ? '#5A5870' : '#F8F7F2',
                textDecoration: isCompleted ? 'line-through' : 'none',
              }}
              transition={{ duration: 0.15 }}
              className="font-sans text-sm block truncate"
            >
              {habit.name}
            </motion.span>
          )}
        </div>

        {/* Right side: completion time + actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {isCompleted && completionTime && (
            <span className="font-sans" style={{ fontSize: '11px', color: '#5A5870' }}>
              Done at {format(new Date(completionTime), 'HH:mm')}
            </span>
          )}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1"
              >
                <button
                  onClick={() => { setEditValue(habit.name); setIsEditing(true) }}
                  className="p-1 rounded transition-colors"
                  style={{ color: '#5A5870' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#9B98B0'}
                  onMouseLeave={e => e.currentTarget.style.color = '#5A5870'}
                  aria-label="Edit habit"
                >
                  <Pencil size={13} />
                </button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      className="p-1 rounded transition-colors"
                      style={{ color: '#5A5870' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#FF6B6B'}
                      onMouseLeave={e => e.currentTarget.style.color = '#5A5870'}
                      aria-label="Delete habit"
                    >
                      <Trash2 size={13} />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent style={{ background: '#1A1A26', border: '1px solid rgba(255,183,213,0.15)', color: '#F8F7F2' }}>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="font-serif" style={{ color: '#F8F7F2' }}>Delete habit?</AlertDialogTitle>
                      <AlertDialogDescription style={{ color: '#9B98B0' }}>
                        "{habit.name}" will be removed from your tracker.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel style={{ background: 'transparent', border: '1px solid rgba(255,183,213,0.2)', color: '#9B98B0' }}>
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteHabit(habit.id)}
                        style={{ background: '#FFB7D5', color: '#0B0B0F' }}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
