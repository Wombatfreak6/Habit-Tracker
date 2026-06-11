import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { Flame, Trophy, CheckCircle, CalendarDays } from 'lucide-react'
import { useHabits } from '../../hooks/useHabits'
import { getDailyStats } from '../../lib/streakUtils'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null
  return (
    <div
      className="font-sans"
      style={{
        background: '#1A1A26',
        border: '1px solid rgba(255,183,213,0.15)',
        borderRadius: '8px',
        padding: '8px 12px',
        fontSize: '12px',
        color: '#F8F7F2',
      }}
    >
      <div style={{ color: '#9B98B0', marginBottom: '4px' }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color }}>
          {p.name}: <strong>{p.value}{p.unit || ''}</strong>
        </div>
      ))}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, iconColor, unit }) {
  return (
    <div
      className="flex flex-col gap-2 p-4"
      style={{
        background: '#1A1A26',
        border: '1px solid rgba(255,183,213,0.08)',
        borderRadius: '8px',
      }}
    >
      <Icon size={20} style={{ color: iconColor }} />
      <div className="font-serif" style={{ fontSize: '28px', color: '#F8F7F2', fontWeight: 300, lineHeight: 1 }}>
        {value}<span className="font-sans" style={{ fontSize: '12px', color: '#9B98B0', marginLeft: '4px' }}>{unit}</span>
      </div>
      <div className="font-sans" style={{ fontSize: '11px', color: '#5A5870' }}>{label}</div>
    </div>
  )
}

export default function AnalyticsSection() {
  const { completionHistory, currentStreak, longestStreak, totalCompleted, weeklyPercent } = useHabits()
  const stats = getDailyStats(completionHistory, 14)

  return (
    <div className="flex flex-col gap-6 pt-4">
      {/* Section header */}
      <div>
        <div style={{ height: '1px', background: 'rgba(255,183,213,0.08)', marginBottom: '12px' }} />
        <div className="font-serif text-xs tracking-widest" style={{ color: '#5A5870', letterSpacing: '0.12em' }}>分析</div>
        <div className="font-sans text-xs" style={{ color: '#5A5870' }}>Analytics</div>
      </div>

      {/* Completion % Chart */}
      <div>
        <div className="font-sans text-xs mb-3" style={{ color: '#9B98B0' }}>Daily Completion — 14 Days</div>
        <ResponsiveContainer width="100%" height={140}>
          <AreaChart data={stats} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
            <defs>
              <linearGradient id="sakuraGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFB7D5" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#FFB7D5" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="rgba(255,183,213,0.06)" />
            <XAxis
              dataKey="date"
              tick={{ fontFamily: 'Noto Serif JP', fontSize: 10, fill: '#5A5870' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis domain={[0, 100]} tick={{ fontFamily: 'Inter', fontSize: 10, fill: '#5A5870' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="percentage"
              name="Completion"
              unit="%"
              stroke="#FFB7D5"
              strokeWidth={2}
              fill="url(#sakuraGrad)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Habit Count Chart */}
      <div>
        <div className="font-sans text-xs mb-3" style={{ color: '#9B98B0' }}>Habits Completed — 14 Days</div>
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={stats} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="rgba(255,183,213,0.06)" />
            <XAxis
              dataKey="date"
              tick={{ fontFamily: 'Noto Serif JP', fontSize: 10, fill: '#5A5870' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={{ fontFamily: 'Inter', fontSize: 10, fill: '#5A5870' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="completed"
              name="Completed"
              stroke="#D4A853"
              strokeWidth={2}
              dot={{ r: 3, fill: '#D4A853', strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={Flame} label="Current Streak" value={currentStreak} unit="days" iconColor="#D4A853" />
        <StatCard icon={Trophy} label="Longest Streak" value={longestStreak} unit="days" iconColor="#D4A853" />
        <StatCard icon={CheckCircle} label="Total Completed" value={totalCompleted} iconColor="#FFB7D5" />
        <StatCard icon={CalendarDays} label="Weekly Avg" value={weeklyPercent} unit="%" iconColor="#4A7C59" />
      </div>
    </div>
  )
}
