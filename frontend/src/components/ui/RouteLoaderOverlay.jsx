import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'

export default function RouteLoaderOverlay({ duration = 420 }) {
  const location = useLocation()
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    setVisible(true)
    const timer = setTimeout(() => setVisible(false), duration)
    return () => clearTimeout(timer)
  }, [location.pathname, duration])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="fixed inset-0 z-[70] bg-bg/85 backdrop-blur-[2px] pointer-events-none"
        >
          <div className="absolute inset-x-0 top-16 h-[2px] bg-border overflow-hidden">
            <motion.div
              initial={{ x: '-60%' }}
              animate={{ x: '120%' }}
              transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
              className="h-full w-1/3 route-loader-sheen"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
