import React from 'react'
import { Loader2 } from 'lucide-react'

export default function LoadingPulse({ rows = 3 }) {
  return (
    <div className="flex min-h-40 items-center justify-center py-10">
      <div className="flex flex-col items-center gap-3 text-center">
        <Loader2 size={24} className="animate-spin text-primary" />
        <div className="text-xs font-mono uppercase tracking-widest text-text-dim">Loading</div>
      </div>
    </div>
  )
}