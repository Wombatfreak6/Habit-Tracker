import { useState } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isBefore, startOfDay, isSameDay } from 'date-fns'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Sheet, SheetContent, SheetHeader } from '@/components/ui/sheet'
import { useHabitStore } from '../../stores/habitStore'
import { useMoodStore, MOODS } from '../../stores/moodStore'
import { toDateKey } from '../../lib/dateHelpers'

const MOOD_EMOJIS = { 1: '⛈', 2: '🌧', 3: '☁️', 4: '☀️', 5: '🗻' }
const JAPANESE_DAYS = ['月曜日','火曜日','水曜日','木曜日','金曜日','土曜日','日曜日']

function getHeatmapColor(percent) {
  if (percent === 0) return '#1A1A26'
  if (percent <= 25) return 'rgba(255,183,213,0.2)'
  if (percent <= 50) return 'rgba(255,183,213,0.45)'
  if (percent <= 75) return 'rgba(255,183,213,0.7)'
  if (percent < 100) return 'rgba(255,183,213,0.9)'
  return '#FFB7D5'
}

// Stone lantern SVG
function LanternIllustration() {
  return (
    <svg width="60" height="80" viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Base */}
      <rect x="15" y="70" width="30" height="4" rx="2" stroke="rgba(248,247,242,0.15)" strokeWidth="1" fill="none"/>
      <rect x="20" y="65" width="20" height="6" rx="1" stroke="rgba(248,247,242,0.15)" strokeWidth="1" fill="none"/>
      {/* Pillar */}
      <rect x="27" y="50" width="6" height="16" stroke="rgba(248,247,242,0.15)" strokeWidth="1" fill="none"/>
      {/* Body */}
      <rect x="14" y="30" width="32" height="22" rx="3" stroke="rgba(248,247,242,0.15)" strokeWidth="1" fill="none"/>
      {/* Light window */}
      <rect x="20" y="35" width="20" height="12" rx="2" stroke="rgba(248,247,242,0.08)" strokeWidth="0.5" fill="rgba(212,168,83,0.04)"/>
      {/* Roof */}
      <path d="M8 32 Q30 18 52 32" stroke="rgba(248,247,242,0.15)" strokeWidth="1" fill="none" strokeLinecap="round"/>
      <path d="M12 30 Q30 22 48 30" stroke="rgba(248,247,242,0.08)" strokeWidth="0.5" fill="none"/>
      {/* Cap */}
      <ellipse cx="30" cy="18" rx="8" ry="3" stroke="rgba(248,247,242,0.12)" strokeWidth="1" fill="none"/>
      <line x1="30" y1="15" x2="30" y2="10" stroke="rgba(248,247,242,0.1)" strokeWidth="1"/>
    </svg>
  )
}

// Torii decoration for sheet header
function ToriiSmall() {
  return (
    <svg width="28" height="32" viewBox="0 0 28 32" fill="none">
      <rect x="2" y="8" width="24" height="2.5" rx="1.25" fill="rgba(248,247,242,0.2)"/>
      <rect x="5" y="12" width="18" height="1.5" rx="0.75" fill="rgba(248,247,242,0.12)"/>
      <rect x="7" y="13.5" width="2" height="15" rx="1" fill="rgba(248,247,242,0.18)"/>
      <rect x="19" y="13.5" width="2" height="15" rx="1" fill="rgba(248,247,242,0.18)"/>
      <path d="M1 8 Q14 2 27 8" fill="none" stroke="rgba(248,247,242,0.15)" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

// Mood icon components (compact versions)
function MoodIconCompact({ level }) {
  const icons = {
    1: () => (
      <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
        <ellipse cx="18" cy="14" rx="10" ry="7" fill="#2A2A3A" stroke="#5A5870" strokeWidth="1"/>
        <path d="M16 20 L13 27 L18 24 L15 31" stroke="#FFB7D5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    2: () => (
      <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
        <ellipse cx="18" cy="12" rx="10" ry="6" fill="#2A2A3A" stroke="#5A5870" strokeWidth="1"/>
        {[12,18,24].map(x => (
          <line key={x} x1={x} y1="20" x2={x-2} y2="30" stroke="#9B98B0" strokeWidth="1.5" strokeLinecap="round"/>
        ))}
      </svg>
    ),
    3: () => (
      <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
        <ellipse cx="20" cy="16" rx="10" ry="7" fill="#2A2A3A" stroke="#5A5870" strokeWidth="1"/>
        <ellipse cx="13" cy="18" rx="7" ry="5" fill="#1E1E2E" stroke="#5A5870" strokeWidth="1"/>
      </svg>
    ),
    4: () => (
      <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="18" r="7" fill="#D4A853" opacity="0.9"/>
        {[0,45,90,135,180,225,270,315].map(a => {
          const r = (a*Math.PI)/180
          return <line key={a} x1={18+Math.cos(r)*9.5} y1={18+Math.sin(r)*9.5} x2={18+Math.cos(r)*12} y2={18+Math.sin(r)*12} stroke="#D4A853" strokeWidth="1.5" strokeLinecap="round"/>
        })}
      </svg>
    ),
    5: () => (
      <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
        <polygon points="18,6 6,28 30,28" fill="#1E1E2E" stroke="#5A5870" strokeWidth="1"/>
        <polygon points="18,6 14,14 22,14" fill="#F8F7F2" opacity="0.7"/>
      </svg>
    ),
  }
  const Icon = icons[level]
  return Icon ? <Icon /> : null
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
  const offset = (startDow + 6) % 7

  const openDay = (day) => {
    if (isBefore(startOfDay(day), today) || isSameDay(day, today)) {
      setSelectedDay(day)
      setSheetOpen(true)
    }
  }

  const selectedKey = selectedDay ? toDateKey(selectedDay) : null
  const selectedData = selectedKey ? completionHistory[selectedKey] : null
  const selectedMood = selectedKey ? moodHistory[selectedKey] : null
  const selectedPercent = selectedData?.total > 0
    ? Math.round((selectedData.completed / selectedData.total) * 100)
    : null

  const selectedDow = selectedDay
    ? JAPANESE_DAYS[(selectedDay.getDay() + 6) % 7]
    : ''

  return (
    <div className="px-4 pb-4">
      <div className="mb-3">
        <div className="font-serif text-xs tracking-widest" style={{ color: '#5A5870', letterSpacing: '0.12em' }}>今月</div>
        <div className="font-sans text-xs" style={{ color: '#5A5870' }}>This Month</div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-2">
        {['M','T','W','T','F','S','S'].map((d,i) => (
          <div key={i} className="text-center font-sans" style={{ fontSize: '9px', color: '#5A5870' }}>{d}</div>
        ))}
      </div>

      {/* Heatmap grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: offset }, (_, i) => <div key={`e-${i}`} style={{ width: 28, height: 28 }} />)}
        {days.map(day => {
          const key = toDateKey(day)
          const data = completionHistory[key]
          const isPast = isBefore(startOfDay(day), today)
          const isTod = isSameDay(day, today)
          const percent = data?.total > 0 ? Math.round((data.completed / data.total) * 100) : 0
          const bgColor = getHeatmapColor(isPast || isTod ? percent : 0)
          const isPerfect = percent === 100 && (data?.total || 0) > 0
          const isClickable = isPast || isTod

          const cell = (
            <div
              key={key}
              onClick={() => openDay(day)}
              className="relative flex items-center justify-center"
              style={{
                width: 28, height: 28,
                borderRadius: '4px',
                background: bgColor,
                cursor: isClickable ? 'pointer' : 'default',
                border: isTod ? '1px solid rgba(255,183,213,0.5)' : '1px solid transparent',
                transition: 'transform 100ms',
              }}
              onMouseEnter={e => { if (isClickable) e.currentTarget.style.transform = 'scale(1.1)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
            >
              {isPerfect && (
                <div style={{ position: 'absolute', top: 2, right: 2, width: 4, height: 4, borderRadius: '50%', background: '#D4A853' }} />
              )}
            </div>
          )

          if (!isClickable) return <div key={key}>{cell}</div>

          return (
            <Tooltip key={key}>
              <TooltipTrigger asChild><div>{cell}</div></TooltipTrigger>
              <TooltipContent side="top" style={{ background: '#1A1A26', border: '1px solid rgba(255,183,213,0.15)', color: '#F8F7F2' }}>
                <div className="flex flex-col gap-1 p-1 text-xs font-sans">
                  <div className="font-serif" style={{ color: '#9B98B0' }}>{format(day, 'MMMM d')}</div>
                  {selectedMood && <div>{MOOD_EMOJIS[moodHistory[key]]} {MOODS.find(m=>m.level===moodHistory[key])?.english}</div>}
                  <div style={{ color: '#9B98B0' }}>{data ? `${data.completed}/${data.total} — ${percent}%` : 'No data'}</div>
                </div>
              </TooltipContent>
            </Tooltip>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1.5 mt-3">
        <span className="font-sans" style={{ fontSize: '9px', color: '#5A5870' }}>0%</span>
        <span className="font-serif" style={{ fontSize: '8px', color: '#5A5870', letterSpacing: '2px' }}>〜〜〜〜〜〜</span>
        {[0,25,50,75,100].map(p => (
          <div key={p} style={{ width: 10, height: 10, borderRadius: '2px', background: getHeatmapColor(p) }} />
        ))}
        <span className="font-serif" style={{ fontSize: '8px', color: '#5A5870', letterSpacing: '2px' }}>〜〜〜〜〜〜</span>
        <span className="font-sans" style={{ fontSize: '9px', color: '#5A5870' }}>100%</span>
      </div>

      {/* ── Redesigned Day Detail Sheet ── */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="right"
          style={{
            width: '420px',
            maxWidth: '420px',
            background: '#0F0F1A',
            borderLeft: '1px solid rgba(255,183,213,0.15)',
            padding: 0,
            overflow: 'hidden auto',
          }}
        >
          {/* Header */}
          <div
            style={{
              minHeight: '140px',
              background: 'linear-gradient(160deg, #0D0D1A 0%, #12122A 100%)',
              padding: '28px 28px 20px',
              position: 'relative',
              borderBottom: 'none',
            }}
          >
            {/* Torii top-right */}
            <div style={{ position: 'absolute', top: 20, right: 24 }}>
              <ToriiSmall />
            </div>

            {/* Day of week in Japanese */}
            {selectedDay && (
              <div className="font-serif" style={{ fontSize: '12px', color: '#FFB7D5', letterSpacing: '0.15em', marginBottom: '6px' }}>
                {selectedDow}
              </div>
            )}

            {/* Day number */}
            {selectedDay && (
              <div className="font-serif" style={{ fontSize: '64px', fontWeight: 200, color: '#F8F7F2', lineHeight: 1 }}>
                {format(selectedDay, 'd')}
              </div>
            )}

            {/* Month + year */}
            {selectedDay && (
              <div className="font-sans" style={{ fontSize: '16px', color: '#9B98B0', marginTop: '4px' }}>
                {format(selectedDay, 'MMMM yyyy')}
              </div>
            )}

            {/* Gradient line at bottom of header */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '1px',
                background: 'linear-gradient(90deg, rgba(255,183,213,0.6) 0%, transparent 100%)',
              }}
            />
          </div>

          {/* Content */}
          <div className="flex flex-col gap-6 p-6">
            {/* Mood section */}
            <div className="flex flex-col gap-3">
              <div className="font-serif" style={{ fontSize: '11px', color: '#5A5870', letterSpacing: '0.1em' }}>気分 / Mood</div>
              {selectedMood ? (
                <div
                  className="flex items-center gap-3"
                  style={{
                    background: 'rgba(255,183,213,0.04)',
                    border: '1px solid rgba(255,183,213,0.15)',
                    borderRadius: '8px',
                    padding: '10px 14px',
                  }}
                >
                  <div style={{ transform: 'scale(1.1)' }}>
                    <MoodIconCompact level={selectedMood} />
                  </div>
                  <div>
                    <div className="font-serif" style={{ fontSize: '18px', color: '#F8F7F2' }}>
                      {MOODS.find(m => m.level === selectedMood)?.kanji}
                    </div>
                    <div className="font-sans" style={{ fontSize: '11px', color: '#9B98B0' }}>
                      {MOODS.find(m => m.level === selectedMood)?.romaji} — {MOODS.find(m => m.level === selectedMood)?.english}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="font-serif text-center py-3" style={{ fontSize: '13px', color: '#3A3848', fontStyle: 'italic' }}>
                  — 記録なし —
                </div>
              )}
            </div>

            {/* Habits section */}
            <div className="flex flex-col gap-3">
              <div className="font-serif" style={{ fontSize: '11px', color: '#5A5870', letterSpacing: '0.1em' }}>習慣 / Habits</div>

              {selectedData && selectedData.total > 0 ? (
                <>
                  {/* Completion bar */}
                  <div className="flex items-center gap-3">
                    <div style={{ flex: 1, height: '6px', background: 'rgba(255,183,213,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${selectedPercent}%`,
                          background: '#FFB7D5',
                          borderRadius: '3px',
                          transition: 'width 600ms ease',
                        }}
                      />
                    </div>
                    <span className="font-sans" style={{ fontSize: '13px', color: '#FFB7D5', flexShrink: 0 }}>
                      {selectedPercent}%
                    </span>
                  </div>

                  {/* Habit list */}
                  <div className="flex flex-col gap-2">
                    {habits.slice(0, selectedData.total).map((habit, i) => {
                      const done = i < selectedData.completed
                      return (
                        <div key={habit.id || i} className="flex items-center gap-2">
                          <div style={{
                            width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                            background: done ? '#FFB7D5' : 'rgba(255,255,255,0.08)',
                            border: done ? 'none' : '1px solid rgba(255,255,255,0.15)',
                          }} />
                          <span className="font-sans text-xs truncate" style={{ color: done ? '#9B98B0' : 'rgba(90,88,112,0.5)' }}>
                            {habit.name}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </>
              ) : (
                <div className="font-serif text-center py-3" style={{ fontSize: '13px', color: '#3A3848', fontStyle: 'italic' }}>
                  — 記録なし —
                </div>
              )}
            </div>

            {/* Stone lantern footer */}
            <div className="flex flex-col items-center gap-2 pt-4 mt-auto">
              <LanternIllustration />
              <div className="font-serif" style={{ fontSize: '10px', color: '#3A3848', letterSpacing: '0.1em' }}>灯籠</div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
