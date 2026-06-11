import { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

function ToriiIcon({ size = 24, color = '#F8F7F2' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="6" width="20" height="2" rx="1" fill={color} opacity="0.9"/>
      <rect x="4" y="9" width="16" height="1.5" rx="0.75" fill={color} opacity="0.6"/>
      <rect x="6" y="10.5" width="2" height="11" rx="1" fill={color} opacity="0.8"/>
      <rect x="16" y="10.5" width="2" height="11" rx="1" fill={color} opacity="0.8"/>
      <path d="M2 6 Q12 1 22 6" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
    </svg>
  )
}

function SkeletonCard() {
  return (
    <div
      className="flex flex-col gap-2 p-4"
      style={{
        background: '#1A1A26',
        borderLeft: '3px solid rgba(255,183,213,0.15)',
        borderRadius: '8px',
      }}
    >
      <div className="flex items-center justify-between">
        <div style={{ width: '60px', height: '18px', background: 'rgba(255,183,213,0.08)', borderRadius: '4px' }} className="animate-pulse" />
        <ToriiIcon size={20} color="rgba(248,247,242,0.2)" />
      </div>
      <div style={{ width: '80%', height: '14px', background: 'rgba(248,247,242,0.06)', borderRadius: '4px' }} className="animate-pulse" />
      <div style={{ width: '60%', height: '14px', background: 'rgba(248,247,242,0.04)', borderRadius: '4px' }} className="animate-pulse" />
      <div style={{ width: '40%', height: '11px', background: 'rgba(248,247,242,0.03)', borderRadius: '4px', alignSelf: 'flex-end', marginTop: '4px' }} className="animate-pulse" />
    </div>
  )
}

function FactContent({ fact }) {
  if (!fact) return null
  const CATEGORY_COLORS = {
    Samurai: '#D4A853',
    History: '#7B68A8',
    Wildlife: '#4A7C59',
    Culture: '#9B98B0',
    Nature: '#FFB7D5',
  }
  const catColor = CATEGORY_COLORS[fact.category] || '#D4A853'

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <span
          className="font-sans inline-block px-2 py-0.5 rounded-full"
          style={{
            fontSize: '10px',
            color: catColor,
            background: 'rgba(42,26,8,0.6)',
            border: `1px solid ${catColor}40`,
          }}
        >
          {fact.category}
        </span>
        <ToriiIcon size={18} color="rgba(248,247,242,0.5)" />
      </div>
      <h3 className="font-serif" style={{ fontSize: '15px', color: '#F8F7F2', lineHeight: 1.4 }}>
        {fact.title}
      </h3>
      <p className="font-sans" style={{ fontSize: '13px', color: '#9B98B0', lineHeight: 1.6 }}>
        {fact.body}
      </p>
      <div className="flex justify-end mt-1">
        <a
          href={fact.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-sans"
          style={{ fontSize: '11px', color: '#5A5870', textDecoration: 'none' }}
          onMouseEnter={e => e.currentTarget.style.color = '#9B98B0'}
          onMouseLeave={e => e.currentTarget.style.color = '#5A5870'}
        >
          via Wikipedia →
        </a>
      </div>
    </div>
  )
}

export default function CulturalFactCard({ fact, loading }) {
  return (
    <div
      style={{
        background: '#1A1A26',
        borderLeft: '3px solid #FFB7D5',
        borderRadius: '8px',
        padding: '16px 20px',
      }}
    >
      {loading ? <SkeletonCard /> : <FactContent fact={fact} />}
    </div>
  )
}
