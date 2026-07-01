import { Routes, Route, useLocation } from 'react-router-dom'
import BottomNav from './components/BottomNav.jsx'
import LandingPage from './pages/LandingPage.jsx'
import HomePage from './pages/HomePage.jsx'
import BookingsPage from './pages/BookingsPage.jsx'
import ReportPage from './pages/ReportPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'

export default function App() {
  const location = useLocation()
  const showNav = location.pathname !== '/'

  return (
    <div className="app">
      <div className="app-scroll">
        <Routes location={location}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/report/:id" element={<ReportPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </div>
      {showNav && <BottomNav />}
    </div>
  )
}
