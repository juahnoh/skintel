import { NavLink, Link } from 'react-router-dom'
import { clinicInfo } from '../data/clinic.js'

// 대시보드 상단: 좌측 병원명 · 가운데 탭(작고 둥근 형) · 우측 상단 나가기
export default function DashNav() {
  return (
    <header className="dash-head">
      <div className="dash-title">
        <div className="dash-kicker">병원 대시보드</div>
        <h1>{clinicInfo.name}</h1>
        <div className="muted">오늘 · 2025. 7. 2 (수)</div>
      </div>
      <nav className="dash-nav">
        <NavLink to="/dashboard" end className="dash-tab">홈</NavLink>
        <NavLink to="/dashboard/quality" className="dash-tab">시술 품질</NavLink>
        <NavLink to="/dashboard/patients" className="dash-tab">환자 관리</NavLink>
      </nav>
      <Link to="/" className="dash-exit">나가기</Link>
    </header>
  )
}
