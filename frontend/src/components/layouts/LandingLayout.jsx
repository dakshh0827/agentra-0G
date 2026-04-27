import React, { useState, useEffect } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { to: '/marketplace', label: 'MARKETPLACE' },
  { to: '/deploy', label: 'DEPLOY' },
  { to: '/dashboard', label: 'DASHBOARD' },
  { to: '/leaderboard', label: 'LEADERBOARD' },
]

export default function LandingLayout() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* Close mobile nav on route change */
  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  return (
    <div className="min-h-screen relative bg-bg text-text-primary">

      <header className={`landing-nav ${scrolled ? 'scrolled' : ''} fixed top-0 left-0 right-0 z-50`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between px-5 h-16">
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <img src="/logo/logo32.png" alt="Agentra" className="w-8 h-8 rounded-xl" />
            <div>
              <div className="font-display font-semibold text-sm text-text-primary">AGENTRA</div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="px-4 py-2 rounded-lg text-[11px] font-mono text-text-muted hover:text-primary hover:bg-accent-pink transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/marketplace">
              <button className="btn-primary px-5 py-2 rounded-lg text-[11px] inline-flex items-center gap-2 cursor-pointer">
                LAUNCH APP
              </button>
            </Link>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-text-secondary p-2 rounded-lg hover:bg-bg-secondary transition-colors cursor-pointer"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-border overflow-hidden bg-panel"
            >
              <nav className="flex flex-col p-4 gap-1">
                {navLinks.map(link => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="px-4 py-3 rounded-lg text-[11px] font-mono text-text-muted hover:text-primary hover:bg-accent-pink transition-all"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link to="/marketplace" className="mt-2">
                  <button className="btn-primary w-full px-5 py-2.5 rounded-lg text-[11px] inline-flex items-center justify-center gap-2 cursor-pointer">
                    LAUNCH APP
                  </button>
                </Link>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="relative z-10">
        <Outlet />
      </main>
    </div>
  )
}



