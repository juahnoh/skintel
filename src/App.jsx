import { useEffect, useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import BottomNav from './components/BottomNav.jsx'
import SplashScreen from './components/SplashScreen.jsx'
import { prefetchFace3D } from './components/LazyFace3D.jsx'
import LandingPage from './pages/LandingPage.jsx'
import CodeEntryPage from './pages/CodeEntryPage.jsx'
import HomePage from './pages/HomePage.jsx'
import BookingsPage from './pages/BookingsPage.jsx'
import ReportPage from './pages/ReportPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import DashQualityPage from './pages/DashQualityPage.jsx'
import DashPatientsPage from './pages/DashPatientsPage.jsx'
import RegisterPatientPage from './pages/RegisterPatientPage.jsx'
import SessionPadPage from './pages/SessionPadPage.jsx'
import OperatorReportPage from './pages/OperatorReportPage.jsx'

export default function App() {
  const [showSplash, setShowSplash] = useState(true)
  const location = useLocation()

  // 앱 로드 후 여유 시간에 3D 얼굴 청크를 미리 받아둔다 (얼굴 페이지 진입 속도 개선)
  useEffect(() => {
    const ric = window.requestIdleCallback || ((fn) => setTimeout(fn, 1200))
    const id = ric(() => prefetchFace3D())
    return () => (window.cancelIdleCallback || clearTimeout)(id)
  }, [])
  const path = location.pathname
  const isLanding = path === '/'
  const isEnter = path === '/enter'
  const isDashboard = path.startsWith('/dashboard')
  const isOperator = path.startsWith('/op')
  const showNav = !isLanding && !isEnter && !isDashboard && !isOperator

  return (
    <div className={`app${isDashboard || isOperator ? ' wide' : ''}`}>
      {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}
      <div className="app-scroll">
        <Routes location={location}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/enter" element={<CodeEntryPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="/report" element={<HomePage />} />
          <Route path="/report/:id" element={<HomePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/dashboard/quality" element={<DashQualityPage />} />
          <Route path="/dashboard/patients" element={<DashPatientsPage />} />
          <Route path="/op/register" element={<RegisterPatientPage />} />
          <Route path="/op/session/:sessionId" element={<SessionPadPage />} />
          <Route path="/op/report/:sessionId" element={<OperatorReportPage />} />
        </Routes>
      </div>
      {showNav && <BottomNav />}
    </div>
  )
}
