import { Routes, Route, useLocation } from 'react-router-dom'
import BottomNav from './components/BottomNav.jsx'
import LandingPage from './pages/LandingPage.jsx'
import HomePage from './pages/HomePage.jsx'
import BookingsPage from './pages/BookingsPage.jsx'
import ReportPage from './pages/ReportPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import DashQualityPage from './pages/DashQualityPage.jsx'
import DashPatientsPage from './pages/DashPatientsPage.jsx'

export default function App() {
  const location = useLocation()
  const path = location.pathname
  const isLanding = path === '/'
  const isDashboard = path.startsWith('/dashboard')
  const showNav = !isLanding && !isDashboard

  return (
    <div className={`app${isDashboard ? ' wide' : ''}`}>
      <div className="app-scroll">
        <Routes location={location}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/report/:id" element={<ReportPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/dashboard/quality" element={<DashQualityPage />} />
          <Route path="/dashboard/patients" element={<DashPatientsPage />} />
        </Routes>
      </div>
      {showNav && <BottomNav />}
    </div>
  )
}
