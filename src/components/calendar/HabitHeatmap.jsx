import { useState } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isBefore, startOfDay, isSameDay } from 'date-fns'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useHabitStore } from '../../stores/habitStore'
import { useMoodStore, MOODS } from '../../stores/moodStore'
import { toDateKey } from '../../lib/dateHelpers'

const MOOD_EMOJIS = { 1: '⛈', 2: '🌧', 3: '☁️', 4: '☀️', 5: '🗻' }

function getHeatmapColor(percent) {
  if (percent === 0) return '#1A1A26'
  if (percent <= 25) return 'rgba(255,183,213,0.2)'
  if (percent <= 50) return 'rgba(255,183,213,0.45)'
  if (percent <= 75) return 'rgba(255,183,213,0.7)'
  if (percent < 100) return 'rgba(255,183,213,0.9)'
  return '#FFB7D5'
}

export default function HabitHeatmap() {
  const [selectedDay, setSelectedDay] = useState(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const completionHistory = useHabitStore(s => s.completionHistory)
  const habits = useHabitStore(s => s.habits)
  const moodHistory = useMoodStore(s => s.history)

  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const today = startOfDay(now)

  const startDow = getDay(monthStart)
  const offset = (startDow + 6) % 7 // Mon-first

  const openDay = (day) => {
    if (isBefore(startOfDay(day), today)) {
      setSelectedDay(day)
      setSheetOpen(true)
    }
  }

  const selectedKey = selectedDay ? toDateKey(selectedDay) : null
  const selectedData = selectedKey ? completionHistory[selectedKey] : null
  const selectedMood = selectedKey ? moodHistory[selectedKey] : null

  return (
    <div className="px-4 pb-4">
      <div className="mb-3">
        <div className="font-serif text-xs tracking-widest" style={{ color: '#5A5870', letterSpacing: '0.12em' }}>今月</div>
        <div className="font-sans text-xs" style={{ color: '#5A5870' }}>This Month</div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-2">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <div key={i} className="text-center font-sans" style={{ fontSize: '9px', color: '#5A5870' }}>{d}</div>
        ))}
      </div>

      {/* Heatmap grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: offset }, (_, i) => (
          <div key={`e-${i}`} style={{ width: 28, height: 28 }} />
        ))}

        {days.map(day => {
          const key = toDateKey(day)
          const data = completionHistory[key]
          const isPast = isBefore(startOfDay(day), today)
          const isToday = isSameDay(day, today)
          const percent = data && data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0
          const bgColor = getHeatmapColor(isPast || isToday ? percent : 0)
          const mood = moodHistory[key]
          const isPerfect = percent === 100 && (data?.total || 0) > 0

          const cell = (
            <div
              key={key}
              onClick={() => openDay(day)}
              className="relative flex items-center justify-center"
              style={{
                width: 28,
                height: 28,
                borderRadius: '4px',
                background: bgColor,
                cursor: isPast ? 'pointer' : 'default',
                border: isToday ? '1px solid rgba(255,183,213,0.5)' : '1px solid transparent',
                transition: 'transform 100ms, opacity 100ms',
              }}
            >
              {isPerfect && (
                <div
                  style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    background: '#D4A853',
                  }}
                />
              )}
            </div>
          )

          if (!isPast) return <div key={key}>{cell}</div>

          return (
            <Tooltip key={key}>
              <TooltipTrigger asChild>
                <div>{cell}</div>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                style={{ background: '#1A1A26', border: '1px solid rgba(255,183,213,0.15)', color: '#F8F7F2' }}
              >
                <div className="flex flex-col gap-1 p-1 text-xs font-sans">
                  <div className="font-serif" style={{ color: '#9B98B0' }}>{format(day, 'MMMM d')}</div>
                  {mood && <div>{MOOD_EMOJIS[mood]} {MOODS.find(m => m.level === mood)?.english}</div>}
                  <div style={{ color: '#9B98B0' }}>
                    {data ? `${data.completed}/${data.total} — ${percent}%` : 'No data'}
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          )
        })}
      </div>

      {/* Color legend */}
      <div className="flex items-center gap-2 mt-3">
        <span className="font-sans" style={{ fontSize: '9px', color: '#5A5870' }}>0%</span>
        {[0, 25, 50, 75, 100].map(p => (
          <div key={p} style={{ width: 12, height: 12, borderRadius: '2px', background: getHeatmapColor(p) }} />
        ))}
        <span className="font-sans" style={{ fontSize: '9px', color: '#5A5870' }}>100%</span>
      </div>

      {/* Day detail sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="right"
          style={{ background: '#12121A', border: '1px solid rgba(255,183,213,0.1)', color: '#F8F7F2' }}
        >
          <SheetHeader>
            <SheetTitle className="font-serif" style={{ color: '#F8F7F2' }}>
              {selectedDay ? format(selectedDay, 'MMMM d, yyyy') : ''}
            </SheetTitle>
          </SheetHeader>
          {selectedDay && (
            <div className="mt-6 flex flex-col gap-4">
              {/* Mood */}
              <div className="flex flex-col gap-1">
                <div className="font-serif text-xs" style={{ color: '#5A5870', letterSpacing: '0.1em' }}>今日の気分 / Mood</div>
                {selectedMood ? (
                  <div className="flex items-center gap-2 font-sans text-sm" style={{ color: '#F8F7F2' }}>
                    <span style={{ fontSize: '20px' }}>{MOOD_EMOJIS[selectedMood]}</span>
                    <span>{MOODS.find(m => m.level === selectedMood)?.kanji} — {MOODS.find(m => m.level === selectedMood)?.english}</span>
                  </div>
                ) : (
                  <div className="font-sans text-sm" style={{ color: '#5A5870' }}>No mood recorded</div>
                )}
              </div>

              {/* Completion */}
              <div className="flex flex-col gap-2">
                <div className="font-serif text-xs" style={{ color: '#5A5870', letterSpacing: '0.1em' }}>習慣 / Habits</div>
                {selectedData ? (
                  <>
                    <div className="font-sans text-2xl font-light" style={{ color: '#FFB7D5' }}>
                      {selectedData.completed}/{selectedData.total}
                      <span className="text-sm ml-2" style={{ color: '#9B98B0' }}>
                        {Math.round((selectedData.completed / selectedData.total) * 100)}%
                      </span>
                    </div>
                    {/* Simple progress bar */}
                    <div style={{ height: '4px', background: 'rgba(255,183,213,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${Math.round((selectedData.completed / selectedData.total) * 100)}%`,
                          background: '#FFB7D5',
                          borderRadius: '2px',
                        }}
                      />
                    </div>
                  </>
                ) : (
                  <div className="font-sans text-sm" style={{ color: '#5A5870' }}>No habit data</div>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
