import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { user, clinic, treatmentHistory } from '../data/sample.js'

const PATIENT_CODE = '20415'
const DOCTOR = '박서준 원장'

export default function ProfilePage() {
  const navigate = useNavigate()
  const [notify, setNotify] = useState(true)

  const visits = treatmentHistory.length
  const totalShots = treatmentHistory.reduce((s, t) => s + t.shots, 0)
  const avgCoverage = Math.round(
    treatmentHistory.reduce((s, t) => s + t.coverage, 0) / (visits || 1),
  )

  return (
    <div className="page profile">
      {/* 프로필 히어로 */}
      <section className="pf-hero">
        <div className="pf-avatar">{user.name[0]}</div>
        <div className="pf-name">
          {user.name}
          <span className="pf-grade">{user.grade}</span>
        </div>
        <div className="pf-code">환자 코드 #{PATIENT_CODE}</div>
      </section>

      {/* 담당 병원·원장 */}
      <section className="pf-card">
        <div className="pf-row">
          <span className="l">담당 병원</span>
          <span className="v">{clinic.name}</span>
        </div>
        <div className="pf-row">
          <span className="l">담당 원장</span>
          <span className="v">{DOCTOR}</span>
        </div>
        <div className="pf-row">
          <span className="l">등록일</span>
          <span className="v">{user.since}</span>
        </div>
      </section>

      {/* 시술 통계 */}
      <section className="pf-stats">
        <div className="pf-stat">
          <b>{visits}</b>
          <span>총 시술</span>
        </div>
        <div className="pf-stat">
          <b>{totalShots.toLocaleString()}</b>
          <span>총 샷수</span>
        </div>
        <div className="pf-stat">
          <b>{avgCoverage}%</b>
          <span>평균 커버리지</span>
        </div>
      </section>

      {/* 설정·알림 */}
      <section className="pf-menu">
        <div className="pf-menu-row">
          <span>알림 받기</span>
          <button
            className={`pf-switch${notify ? ' on' : ''}`}
            onClick={() => setNotify((n) => !n)}
            aria-label="알림 토글"
          >
            <i />
          </button>
        </div>
        <button className="pf-menu-row link">
          <span>개인정보 관리</span>
          <span className="chev">›</span>
        </button>
        <button className="pf-menu-row link">
          <span>이용약관</span>
          <span className="chev">›</span>
        </button>
        <button className="pf-menu-row link">
          <span>고객센터</span>
          <span className="chev">›</span>
        </button>
      </section>

      <button className="pf-logout" onClick={() => navigate('/')}>
        로그아웃
      </button>
    </div>
  )
}
