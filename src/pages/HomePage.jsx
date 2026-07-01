import { Link } from 'react-router-dom'
import { user, report, bookings } from '../data/sample.js'
import RadialGauge from '../components/RadialGauge.jsx'

function formatDate(d) {
  const [y, m, day] = d.split('-')
  return `${Number(m)}월 ${Number(day)}일`
}

export default function HomePage() {
  const today = '2025-07-01'
  const upcoming = bookings
    .filter((b) => b.status === '예약확정' && b.date >= today)
    .sort((a, b) => (a.date > b.date ? 1 : -1))[0]

  return (
    <div className="page home">
      <header className="home-head">
        <div className="home-hi">
          <div className="avatar">{user.name[0]}</div>
          <div>
            <div className="home-hi-hello">안녕하세요 👋</div>
            <div className="home-hi-name">{user.name}님</div>
          </div>
        </div>
        <div className="grade-pill">{user.grade}</div>
      </header>

      <section className="hero-card">
        <div className="hero-text">
          <h1>피부는 데이터로,<br />관리는 스마트하게</h1>
          <p>내 시술 기록과 다음 예약을 한눈에</p>
        </div>
        <div className="hero-glow" />
      </section>

      {upcoming && (
        <Link to="/bookings" className="next-card">
          <div className="next-label">다가오는 예약</div>
          <div className="next-main">
            <div className="next-date">{formatDate(upcoming.date)}</div>
            <div className="next-info">
              <div className="next-menu">{upcoming.menu}</div>
              <div className="muted">{upcoming.time} · {upcoming.practitioner}</div>
            </div>
          </div>
          <span className="chevron">›</span>
        </Link>
      )}

      <section className="metric-card">
        <div className="section-title">
          <h2>피부 개선 지표</h2>
          <span className="muted">{formatDate(report.date)} 시술 기준</span>
        </div>
        <div className="metric-gauges">
          {report.metrics.map((m) => (
            <RadialGauge key={m.label} value={m.value} label={m.label} color={m.color} />
          ))}
        </div>
      </section>

      <Link to="/report" className="report-teaser">
        <div className="report-teaser-body">
          <div className="report-teaser-label">최근 시술 리포트</div>
          <div className="report-teaser-title">{report.procedure}</div>
          <div className="muted">
            총 {report.totalShots.toLocaleString()}샷 · {report.totalEnergy.toLocaleString()}J
          </div>
        </div>
        <img className="report-teaser-thumb" src={report.afterPhoto} alt="" />
      </Link>
    </div>
  )
}
