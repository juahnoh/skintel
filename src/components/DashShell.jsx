import { NavLink } from 'react-router-dom'
import { clinicInfo } from '../data/clinic.js'

// 병원용 공통 셸: 상단 skintel+병원명 헤더 + 하단 pill 네비 (홈/시술커버리지/환자관리)
export default function DashShell({ children, operator }) {
  return (
    <div className="dashx">
      <header className="dashx-head">
        <div className="op-brand">
          <span className="op-logo" /> skintel
        </div>
        <div className="dashx-clinic">
          <span>병원</span>
          <b>{clinicInfo.name}</b>
        </div>
        {operator && (
          <div className="dashx-clinic">
            <span>시술자</span>
            <b>{operator}</b>
          </div>
        )}
      </header>

      <div className="dash dashx-body">{children}</div>

      <nav className="dashx-nav">
        <NavLink to="/dashboard" end className="dashx-tab" aria-label="홈">
          <HomeIcon />
        </NavLink>
        <NavLink to="/dashboard/quality" className="dashx-tab" aria-label="시술 커버리지">
          <ChartIcon />
        </NavLink>
        <NavLink to="/dashboard/patients" className="dashx-tab" aria-label="환자 관리">
          <UserIcon />
        </NavLink>
      </nav>
    </div>
  )
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="dashx-ico">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V20h14V9.5" />
    </svg>
  )
}
function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="dashx-ico">
      <path d="M5 20V10M12 20V4M19 20v-7" />
    </svg>
  )
}
function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" className="dashx-ico">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c1.5-4 5-5 8-5s6.5 1 8 5" />
    </svg>
  )
}
