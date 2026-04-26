import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutGrid, Upload, BarChart3, Trophy,
  Cpu, ChevronLeft, ChevronRight, Home,
} from 'lucide-react'
import clsx from 'clsx'

const navItems = [
  { to: '/marketplace', icon: LayoutGrid, label: 'Marketplace', sublabel: 'Discover agents' },
  { to: '/deploy', icon: Upload, label: 'Deploy', sublabel: 'Launch agent' },
  { to: '/dashboard', icon: BarChart3, label: 'Dashboard', sublabel: 'Analytics' },
  { to: '/leaderboard', icon: Trophy, label: 'Leaderboard', sublabel: 'Rankings' },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 220 }}
        transition={{ type: 'spring', stiffness: 350, damping: 35 }}
        className="hidden lg:flex flex-col h-screen relative z-20 overflow-hidden shrink-0"
        style={{
          background: 'rgba(10, 8, 18, 0.97)',
          borderRight: '1px solid rgba(180, 92, 202, 0.08)',
        }}
      >
        {/* Logo header */}
        <div className={clsx(
          "flex items-center justify-between py-5",
          collapsed ? "px-4" : "px-5",
          "border-b border-[rgba(180,92,202,0.08)]"
        )}>
          <NavLink to="/" className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[rgba(180,92,202,0.12)] border border-[rgba(180,92,202,0.25)] flex items-center justify-center shrink-0">
              <Cpu size={15} className="text-[#B45CCA]" />
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.15 }}
                  className="min-w-0"
                >
                  <div className="font-display font-black text-sm text-[#F5F0FF] tracking-tight leading-none">AGENTRA</div>
                  <div className="text-xs text-[#5A4E70] font-mono tracking-widest mt-0.5">Neural Platform</div>
                </motion.div>
              )}
            </AnimatePresence>
          </NavLink>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-[#5A4E70] hover:text-[#B45CCA] hover:bg-[rgba(180,92,202,0.08)] transition-all shrink-0"
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 p-3 space-y-1 overflow-hidden">
          {navItems.map(({ to, icon: Icon, label, sublabel }) => {
            const isActive = location.pathname.startsWith(to)
            return (
              <NavLink key={to} to={to}>
                <motion.div
                  whileHover={{ x: collapsed ? 0 : 3 }}
                  transition={{ duration: 0.15 }}
                  className={clsx(
                    'flex items-center gap-3 rounded-xl transition-all duration-200',
                    collapsed ? 'px-3 py-3 justify-center' : 'px-3 py-2.5',
                    isActive
                      ? 'bg-[rgba(180,92,202,0.12)] border border-[rgba(180,92,202,0.2)]'
                      : 'border border-transparent hover:bg-[rgba(180,92,202,0.05)] hover:border-[rgba(180,92,202,0.08)]'
                  )}
                >
                  <Icon
                    size={16}
                    className={isActive ? 'text-[#B45CCA] shrink-0' : 'text-[#5A4E70] shrink-0'}
                  />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex-1 min-w-0"
                      >
                        <div className={clsx(
                          'text-sm font-semibold tracking-tight',
                          isActive ? 'text-[#D084DA]' : 'text-[#8B7FA0]'
                        )}>
                          {label}
                        </div>
                        <div className="text-xs text-[#5A4E70] leading-none mt-0.5">{sublabel}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {isActive && !collapsed && (
                    <div className="w-1 h-1 rounded-full bg-[#B45CCA] shrink-0" />
                  )}
                </motion.div>
              </NavLink>
            )
          })}
        </nav>

        {/* Home link */}
        <div className={clsx("px-3 pb-2", collapsed && "flex justify-center")}>
          <NavLink to="/">
            <div className={clsx(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all border border-transparent hover:bg-[rgba(180,92,202,0.05)] hover:border-[rgba(180,92,202,0.08)]",
              collapsed && "justify-center"
            )}>
              <Home size={16} className="text-[#5A4E70] shrink-0" />
              {!collapsed && (
                <span className="text-sm font-semibold text-[#5A4E70] tracking-tight">Home</span>
              )}
            </div>
          </NavLink>
        </div>

        {/* Bottom status */}
        {!collapsed && (
          <div className="px-4 py-4 border-t border-[rgba(180,92,202,0.08)]">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] pulse-dot" />
              <span className="text-xs font-mono text-[#5A4E70] tracking-widest uppercase">Network Live</span>
            </div>
          </div>
        )}
      </motion.aside>

      {/* ── Mobile bottom navigation ── */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-[rgba(180,92,202,0.1)]"
        style={{ background: 'rgba(10, 8, 18, 0.97)', backdropFilter: 'blur(20px)' }}
      >
        <div className="flex items-center justify-around py-2 px-1 safe-area-inset-bottom">
          {navItems.map(({ to, icon: Icon, label }) => {
            const isActive = location.pathname.startsWith(to)
            return (
              <NavLink key={to} to={to} className="flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-colors">
                <Icon
                  size={18}
                  className={isActive ? 'text-[#B45CCA]' : 'text-[#5A4E70]'}
                />
                <span className={clsx(
                  'text-xs font-semibold tracking-tight',
                  isActive ? 'text-[#B45CCA]' : 'text-[#5A4E70]'
                )}>
                  {label.slice(0, 7)}
                </span>
              </NavLink>
            )
          })}
        </div>
      </nav>
    </>
  )
}