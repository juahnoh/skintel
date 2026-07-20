import { NavLink } from 'react-router-dom'

const TABS = [
  { to: '/home', label: '홈', icon: HomeIcon },
  { to: '/bookings', label: '예약', icon: CalendarIcon },
  { to: '/profile', label: '내 정보', icon: UserIcon },
]

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      {TABS.map(({ to, label, icon: Icon }) => (
        <NavLink key={to} to={to} className="nav-item" aria-label={label}>
          <span className="nav-ico">
            <Icon />
          </span>
        </NavLink>
      ))}
    </nav>
  )
}

/* 심플한 라인 아이콘들 */
function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="nav-icon">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V20h14V9.5" />
    </svg>
  )
}
function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="nav-icon">
      <rect x="3.5" y="5" width="17" height="16" rx="3" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" />
    </svg>
  )
}
function ReportIcon() {
  return (
    <svg viewBox="0 0 24 24" className="nav-icon">
      <path d="M12 3a9 9 0 1 0 9 9" />
      <path d="M12 3v9l6.5 3.5" />
    </svg>
  )
}
function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" className="nav-icon">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c1.5-4 5-5 8-5s6.5 1 8 5" />
    </svg>
  )
}
