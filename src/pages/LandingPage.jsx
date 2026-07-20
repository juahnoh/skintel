import { useNavigate } from 'react-router-dom'

// 앱 시작 랜딩(역할 선택). 배경 없이 미니멀.
export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="landing clean">
      <div className="landing-top">
        <div className="landing-logo">
          <span className="splash-mark" />
          <span className="splash-word">skintel</span>
        </div>
        <h1 className="landing-title">
          데이터로 기록하는<br />
          나만의 피부 시술 여정
        </h1>
      </div>

      <div className="landing-roles">
        <button className="role-card patient" onClick={() => navigate('/enter')}>
          <span className="role-ic">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-6 8-6s8 2 8 6" />
            </svg>
          </span>
          <span className="role-txt">
            <b>환자용</b>
            <em>코드 입력하고 내 시술 리포트 보기</em>
          </span>
          <span className="role-arrow">→</span>
        </button>

        <button className="role-card clinic" onClick={() => navigate('/dashboard')}>
          <span className="role-ic">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 21V6l8-3 8 3v15" />
              <path d="M9 21v-5h6v5" />
              <path d="M12 8v-1M9 11h6M9 14h6" />
            </svg>
          </span>
          <span className="role-txt">
            <b>병원용</b>
            <em>대시보드 · 환자 관리 · 커버리지</em>
          </span>
          <span className="role-arrow">→</span>
        </button>

        <button className="role-card operator" onClick={() => navigate('/op/register')}>
          <span className="role-ic">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" />
              <path d="M6 11a6 6 0 0 0 12 0M12 17v4" />
            </svg>
          </span>
          <span className="role-txt">
            <b>시술자용</b>
            <em>환자 등록 · 시술 시작</em>
          </span>
          <span className="role-arrow">→</span>
        </button>
      </div>
    </div>
  )
}
