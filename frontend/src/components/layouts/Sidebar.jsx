import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutGrid, Upload, BarChart3, Trophy,
  ChevronLeft, ChevronRight, Home, PanelLeft,
} from 'lucide-react'
import clsx from 'clsx'

const navItems = [
  { to: '/marketplace', icon: LayoutGrid, label: 'Marketplace', sublabel: 'Discover agents' },
  { to: '/deploy', icon: Upload, label: 'Deploy', sublabel: 'Launch agent' },
  { to: '/dashboard', icon: BarChart3, label: 'Dashboard', sublabel: 'Analytics' },
  { to: '/leaderboard', icon: Trophy, label: 'Leaderboard', sublabel: 'Rankings' },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(true)
  const location = useLocation()

  return (
    <>
      <motion.aside
        animate={{ width: collapsed ? 84 : 250 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="hidden lg:flex flex-col h-[calc(100vh-1.5rem)] my-3 ml-3 mr-2 rounded-2xl z-20 overflow-hidden shrink-0 border"
        style={{
          background: 'var(--color-panel)',
          borderColor: 'var(--color-panel-border)',
          boxShadow: '0 10px 20px rgba(89, 58, 40, 0.08)',
        }}
      >
        <div className={clsx(
          "flex items-center justify-between py-4",
          collapsed ? "px-4" : "px-5",
          "border-b border-border"
        )}>
          <NavLink to="/" className="flex items-center gap-3 min-w-0">
            <img src="/logo/logo48.png" alt="Agentra" className="w-9 h-9 rounded-xl shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.15 }}
                  className="min-w-0"
                >
                  <div className="font-display font-semibold text-sm text-text-primary tracking-tight leading-none">AGENTRA</div>
                  <div className="text-xs text-text-dim font-mono tracking-wide mt-0.5">Control Hub</div>
                </motion.div>
              )}
            </AnimatePresence>
          </NavLink>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg text-text-dim hover:text-primary hover:bg-accent-pink transition-all shrink-0"
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-2 overflow-hidden">
          {navItems.map(({ to, icon: Icon, label, sublabel }) => {
            const isActive = location.pathname.startsWith(to)
            return (
              <NavLink key={to} to={to}>
                <motion.div
                  whileHover={{ x: collapsed ? 0 : 2 }}
                  transition={{ duration: 0.15 }}
                  className={clsx(
                    'flex items-center gap-3 rounded-xl transition-all duration-200',
                    collapsed ? 'px-3 py-3 justify-center' : 'px-3 py-2.5',
                    isActive
                      ? 'nav-link-active'
                      : 'nav-link-idle'
                  )}
                >
                  <Icon
                    size={16}
                    className={isActive ? 'text-primary shrink-0' : 'text-text-dim shrink-0'}
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
                          isActive ? 'text-primary-dark' : 'text-text-secondary'
                        )}>
                          {label}
                        </div>
                        <div className="text-xs text-text-dim leading-none mt-0.5">{sublabel}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {isActive && !collapsed && (
                    <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  )}
                </motion.div>
              </NavLink>
            )
          })}
        </nav>

        <div className={clsx("px-3 pb-2", collapsed && "flex justify-center")}>
          <NavLink to="/">
            <div className={clsx(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all border border-transparent hover:bg-bg-secondary hover:border-border",
              collapsed && "justify-center"
            )}>
              <Home size={16} className="text-text-dim shrink-0" />
              {!collapsed && (
                <span className="text-sm font-semibold text-text-secondary tracking-tight">Home</span>
              )}
            </div>
          </NavLink>
        </div>

        {!collapsed ? (
          <div className="px-4 py-3 border-t border-border">
            <div className="rounded-lg bg-bg-secondary border border-border px-3 py-2.5 flex items-center gap-2">
              <PanelLeft size={13} className="text-primary" />
              <span className="text-xs font-mono text-text-dim tracking-wide">Compact Nav Enabled</span>
            </div>
          </div>
        ) : null}
      </motion.aside>

      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border"
        style={{ background: 'var(--color-panel)' }}
      >
        <div className="flex items-center justify-around py-2 px-1 safe-area-inset-bottom">
          {navItems.map(({ to, icon: Icon, label }) => {
            const isActive = location.pathname.startsWith(to)
            return (
              <NavLink key={to} to={to} className="flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-colors">
                <Icon
                  size={18}
                  className={isActive ? 'text-primary' : 'text-text-dim'}
                />
                <span className={clsx(
                  'text-xs font-semibold tracking-tight',
                  isActive ? 'text-primary' : 'text-text-dim'
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