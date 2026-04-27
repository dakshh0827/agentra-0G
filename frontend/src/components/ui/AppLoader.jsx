import React from 'react'
import { motion } from 'framer-motion'
import { Cpu } from 'lucide-react'

export default function AppLoader({ compact = false }) {
  return (
    <div className={`w-full ${compact ? 'min-h-[40vh]' : 'min-h-screen'} bg-bg flex items-center justify-center px-6`}>
      <div className="w-full max-w-xl rounded-2xl border border-border bg-panel px-6 py-7 sm:px-8 sm:py-9">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 8, -8, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            className="w-11 h-11 rounded-xl bg-accent-pink border border-[#d8b7c9] flex items-center justify-center"
          >
            <Cpu size={19} className="text-primary" />
          </motion.div>
          <div>
            <p className="font-display font-semibold text-lg text-text-primary leading-none">Agentra</p>
            <p className="text-xs text-text-dim mt-1 uppercase tracking-wide">Loading Neural Surfaces</p>
          </div>
        </div>

        <div className="mt-6 h-2 w-full rounded-full bg-bg-secondary border border-border overflow-hidden">
          <motion.div
            initial={{ x: '-55%' }}
            animate={{ x: '105%' }}
            transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
            className="route-loader-sheen h-full w-1/2"
          />
        </div>
      </div>
    </div>
  )
}
