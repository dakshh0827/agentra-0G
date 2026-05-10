import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppLoader from './components/ui/AppLoader'

const Layout = lazy(() => import('./components/layouts/Layout'))
const LandingLayout = lazy(() => import('./components/layouts/LandingLayout'))
const LandingPage = lazy(() => import('./pages/LandingPage'))
const Explorer = lazy(() => import('./pages/Explorer')) 
const AgentDetail = lazy(() => import('./pages/AgentDetail'))
const DeployStudio = lazy(() => import('./pages/DeployStudio'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Leaderboard = lazy(() => import('./pages/Leaderboard'))

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<AppLoader />}>
        <Routes>
          {/* Landing page with its own layout (navbar, no sidebar) */}
          <Route element={<LandingLayout />}>
            <Route path="/" element={<LandingPage />} />
          </Route>

          {/* App pages with sidebar layout */}
          <Route element={<Layout />}>
            <Route path="explorer" element={<Explorer />} />
            <Route path="agent/:id" element={<AgentDetail />} />
            <Route path="deploy" element={<DeployStudio />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="leaderboard" element={<Leaderboard />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App