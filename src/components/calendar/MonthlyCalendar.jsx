import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isBefore, startOfDay } from 'date-fns'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useHabitStore } from '../../stores/habitStore'
import { useMoodStore, MOODS } from '../../stores/moodStore'
import { toDateKey, getJapaneseMonth, JAPANESE_MONTHS } from '../../lib/dateHelpers'

const MOOD_EMOJIS = { 1: '⛈', 2: '🌧', 3: '☁️', 4: '☀️', 5: '🗻' }

function CompletionRing({ percent, size = 12 }) {
  const r = (size - 2) / 2
  const circ = 2 * Math.PI * r
  const dash = (percent / 100) * circ
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,183,213,0.12)" strokeWidth="1.5" />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke="#FFB7D5"
        strokeWidth="1.5"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
      />
    </svg>
  )
}

export default function MonthlyCalendar() {
  const [viewDate, setViewDate] = useState(new Date())
  const completionHistory = useHabitStore(s => s.completionHistory)
  const moodHistory = useMoodStore(s => s.history)

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const monthStart = startOfMonth(viewDate)
  const monthEnd = endOfMonth(viewDate)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startDow = getDay(monthStart) // 0=Sun
  // Shift so Mon=0
  const offset = (startDow + 6) % 7

  const today = startOfDay(new Date())

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1))
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1))

  const japMonth = JAPANESE_MONTHS[month]
  const engMonth = format(viewDate, 'MMMM')

  return (
    <div className="px-4 pb-4">
      {/* Section label */}
      <div className="mb-3">
        <div className="font-serif text-xs tracking-widest" style={{ color: '#5A5870', letterSpacing: '0.12em' }}>今月</div>
        <div className="font-sans text-xs" style={{ color: '#5A5870' }}>This Month</div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className="p-1 rounded hover:bg-white/5 transition-colors" style={{ color: '#5A5870' }}>
          <ChevronLeft size={14} />
        </button>
        <div className="text-center">
          <div className="font-serif text-sm" style={{ color: '#F8F7F2' }}>{japMonth}</div>
          <div className="font-sans text-xs" style={{ color: '#9B98B0' }}>{engMonth} {year}</div>
        </div>
        <button onClick={nextMonth} className="p-1 rounded hover:bg-white/5 transition-colors" style={{ color: '#5A5870' }}>
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 mb-1">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <div key={i} className="text-center font-sans" style={{ fontSize: '9px', color: '#5A5870', padding: '2px 0' }}>{d}</div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {/* Empty offset cells */}
        {Array.from({ length: offset }, (_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {days.map(day => {
          const key = toDateKey(day)
          const isToday = isSameDay(day, today)
          const isPastDay = isBefore(startOfDay(day), today)
          const data = completionHistory[key]
          const mood = moodHistory[key]
          const percent = data && data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0
          const isPerfect = percent === 100 && data?.total > 0

          const cell = (
            <div
              key={key}
              className="relative flex flex-col items-center justify-center"
              style={{
                width: '34px',
                height: '40px',
                borderRadius: '6px',
                background: isToday ? 'rgba(255,183,213,0.05)' : 'transparent',
                border: isToday ? '1px solid rgba(255,183,213,0.4)' : '1px solid transparent',
                cursor: isPastDay ? 'pointer' : 'default',
              }}
            >
              {/* Gold dot for perfect day */}
              {isPerfect && (
                <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#D4A853', position: 'absolute', top: '4px' }} />
              )}
              {/* Date number */}
              <span
                className="font-sans"
                style={{
                  fontSize: '11px',
                  color: isToday ? '#F8F7F2' : '#5A5870',
                  lineHeight: 1,
                  marginTop: isPerfect ? '4px' : '0',
                }}
              >
                {format(day, 'd')}
              </span>
              {/* Bottom row: mood + ring */}
              <div className="flex items-center gap-1 mt-1">
                {mood && (
                  <span style={{ fontSize: '6px', lineHeight: 1 }}>{MOOD_EMOJIS[mood]}</span>
                )}
                {data && data.total > 0 && (
                  <CompletionRing percent={percent} size={12} />
                )}
              </div>
            </div>
          )

          if (!isPastDay) return cell

          return (
            <Tooltip key={key}>
              <TooltipTrigger asChild>{cell}</TooltipTrigger>
              <TooltipContent
                side="top"
                className="font-sans text-xs"
                style={{ background: '#1A1A26', border: '1px solid rgba(255,183,213,0.15)', color: '#F8F7F2' }}
              >
                <div className="flex flex-col gap-1 p-1">
                  <div className="font-serif text-xs" style={{ color: '#9B98B0' }}>{format(day, 'MMMM d, yyyy')}</div>
                  {mood && (
                    <div className="flex items-center gap-1">
                      <span>{MOOD_EMOJIS[mood]}</span>
                      <span style={{ color: '#F8F7F2' }}>{MOODS.find(m => m.level === mood)?.english}</span>
                    </div>
                  )}
                  <div style={{ color: '#9B98B0' }}>
                    {data ? `${data.completed}/${data.total} habits — ${percent}%` : 'No data'}
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          )
        })}
      </div>
    </div>
  )
}
