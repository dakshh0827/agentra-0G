import React from 'react'
import clsx from 'clsx'

const colorMap = {
  purple: { text: 'text-[#B45CCA]', border: 'border-[rgba(180,92,202,0.2)]', bg: 'bg-[rgba(180,92,202,0.06)]', glow: 'rgba(180,92,202,0.1)' },
  blue: { text: 'text-[#93C5FD]', border: 'border-[rgba(147,197,253,0.2)]', bg: 'bg-[rgba(147,197,253,0.06)]', glow: 'rgba(147,197,253,0.08)' },
  green: { text: 'text-[#34D399]', border: 'border-[rgba(52,211,153,0.2)]', bg: 'bg-[rgba(52,211,153,0.06)]', glow: 'rgba(52,211,153,0.08)' },
  yellow: { text: 'text-[#FBBF24]', border: 'border-[rgba(251,191,36,0.2)]', bg: 'bg-[rgba(251,191,36,0.06)]', glow: 'rgba(251,191,36,0.08)' },
  red: { text: 'text-[#F87171]', border: 'border-[rgba(248,113,113,0.2)]', bg: 'bg-[rgba(248,113,113,0.06)]', glow: 'rgba(248,113,113,0.08)' },
}

export default function MetricBadge({ label, value, color = 'purple', icon: Icon, sublabel }) {
  const c = colorMap[color] || colorMap.purple
  return (
    <div className={clsx('rounded-xl p-4 border', c.bg, c.border)}>
      <div className={clsx('flex items-center gap-2 mb-2', c.text)}>
        {Icon && <Icon size={13} />}
        <span className="text-xs font-mono tracking-widest uppercase opacity-60">{label}</span>
      </div>
      <div className={clsx('text-2xl font-display font-bold tracking-tighter', c.text)}>{value}</div>
      {sublabel && <div className={clsx('text-xs font-mono mt-1 opacity-50', c.text)}>{sublabel}</div>}
    </div>
  )
}