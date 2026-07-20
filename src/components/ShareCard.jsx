import { user, report, treatmentHistory } from '../data/sample.js'

const ORD = { 1: '첫', 2: '두', 3: '세', 4: '네', 5: '다섯' }

// 공유 카드 모달 — 오른쪽 상단 공유 버튼에서 열림.
export default function ShareCard({ onClose }) {
  const visit = treatmentHistory.length
  const nth = ORD[visit] || `${visit}`

  async function share() {
    const text = `${user.name}님 · ${report.procedure} ${visit}회차 · ${report.totalLines} shots · 커버리지 ${report.coverage}%`
    try {
      if (navigator.share) await navigator.share({ title: 'Skintel 시술 리포트', text })
      else await navigator.clipboard.writeText(text)
    } catch {
      /* 취소/미지원 무시 */
    }
  }

  return (
    <div className="sc-overlay" onClick={onClose}>
      <div className="sc-wrap" onClick={(e) => e.stopPropagation()}>
        <button className="sc-close" onClick={onClose}>닫기</button>

        <div className="sc-card">
          <div className="sc-row-top">
            <div className="sc-brand">Ulthera®</div>
            <div className="sc-sub">{report.procedure} {visit}회차</div>
          </div>

          <div className="sc-stats">
            <div className="sc-big">
              <b>{report.totalLines.toLocaleString()}</b> <span>shots</span>
            </div>
            <div className="sc-stat">
              <b>{report.coverage}%</b>
              <span>커버리지</span>
            </div>
            <div className="sc-stat">
              <b>{report.totalEnergy}J</b>
              <span>에너지</span>
            </div>
          </div>

          <div className="sc-divider" />
          <p className="sc-msg">
            올해 {nth} 번째 관리 완료!<br />
            지난 시술보다 턱선을 {report.compare[0].delta}% 더 꼼꼼하게 받았어요.
          </p>
          <div className="sc-divider" />

          <div className="sc-row-bottom">
            <span>{user.name}님</span>
            <span className="sc-date">{report.date}</span>
          </div>
        </div>

        <div className="sc-actions">
          <button className="sc-btn ghost" onClick={onClose}>
            <ScSave /> 이미지로 저장
          </button>
          <button className="sc-btn primary" onClick={share}>
            <ScShare /> 공유하기
          </button>
        </div>
      </div>
    </div>
  )
}

function ScSave() {
  return (
    <svg viewBox="0 0 24 24" className="sc-ico">
      <path d="M12 3v11M12 14l-4-4M12 14l4-4" />
      <path d="M5 20h14" />
    </svg>
  )
}
function ScShare() {
  return (
    <svg viewBox="0 0 24 24" className="sc-ico">
      <path d="M12 3v13M12 3l-4 4M12 3l4 4" />
      <path d="M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7" />
    </svg>
  )
}
