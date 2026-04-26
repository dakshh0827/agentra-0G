import React from 'react'

export default function LoadingPulse({ rows = 3 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl p-5 space-y-3"
          style={{ background: 'rgba(17,13,30,0.8)', border: '1px solid rgba(180,92,202,0.08)' }}
        >
          <div className="flex gap-3">
            <div className="shimmer-load w-10 h-10 rounded-xl" />
            <div className="flex-1 space-y-2">
              <div className="shimmer-load h-3.5 w-1/3 rounded-lg" />
              <div className="shimmer-load h-3 w-1/4 rounded-lg" />
            </div>
          </div>
          <div className="shimmer-load h-3 w-full rounded-lg" />
          <div className="shimmer-load h-3 w-2/3 rounded-lg" />
          <div className="flex gap-2 pt-2 border-t border-[rgba(180,92,202,0.06)]">
            <div className="shimmer-load h-3 w-1/4 rounded-lg" />
            <div className="shimmer-load h-3 w-1/4 rounded-lg" />
            <div className="shimmer-load h-3 w-1/4 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  )
}