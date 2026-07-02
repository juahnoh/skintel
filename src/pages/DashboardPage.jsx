import { kpis, todaySchedule, retention, monthlyTrend } from '../data/clinic.js'
import DashNav from '../components/DashNav.jsx'
import PatientAvatar from '../components/PatientAvatar.jsx'

export default function DashboardPage() {
  const maxTrend = Math.max(...monthlyTrend.map((t) => t.v))

  return (
    <div className="dash">
      <DashNav />

      {/* 월별 시술 추이 (맨 위, 박스 없이 가로 스크롤) */}
      <div className="trend">
        <div className="trend-head">
          <h2>월별 시술 추이</h2>
          <span className="muted">최근 {monthlyTrend.length}개월</span>
        </div>
        <div className="trend-strip">
          {monthlyTrend.map((t) => (
            <div key={t.m} className="trend-item">
              <span className="trend-val">{t.v}</span>
              <div className="trend-bar-wrap">
                <div className="trend-bar" style={{ height: `${(t.v / maxTrend) * 72}px` }} />
              </div>
              <span className="trend-m">{t.m}</span>
            </div>
          ))}
        </div>
      </div>

      {/* KPI (작고 깔끔하게) */}
      <section className="dash-kpis">
        <div className="dash-kpi"><div className="dash-kpi-v">{kpis.todaySessions}</div><div className="dash-kpi-l">오늘 시술</div></div>
        <div className="dash-kpi"><div className="dash-kpi-v">{kpis.weekBookings}</div><div className="dash-kpi-l">이번 주 예약</div></div>
        <div className="dash-kpi"><div className="dash-kpi-v">{kpis.avgCoverage}<small>%</small></div><div className="dash-kpi-l">평균 커버리지</div></div>
        <div className="dash-kpi"><div className="dash-kpi-v">{kpis.adherence}<small>%</small></div><div className="dash-kpi-l">프로토콜 준수율</div></div>
      </section>

      {/* 오늘의 시술 현황 */}
      <section className="panel">
        <div className="panel-head"><h2>오늘의 시술 현황</h2><span className="muted">{todaySchedule.length}건</span></div>
        <div className="sched">
          {todaySchedule.map((s, i) => (
            <div key={i} className="sched-row">
              <div className="sched-time">{s.time}</div>
              <div className="sched-body">
                <div className="sched-patient">{s.patient}</div>
                <div className="muted">{s.procedure} · {s.doctor} 원장</div>
              </div>
              <span className={`status status-${s.status}`}>
                {s.status === '시술중' && <span className="dot-pulse" />}
                {s.status}{s.coverage ? ` ${s.coverage}%` : ''}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 재방문 관리 (맨 밑) */}
      <section className="panel">
        <div className="panel-head"><h2>재방문 관리</h2><span className="badge-soft">{retention.length}명 대상</span></div>
        <div className="muted panel-desc">리프팅 주기(약 12개월)가 도래한 환자예요. 재방문을 유도해보세요.</div>
        <div className="retain">
          {retention.map((r, i) => (
            <div key={i} className="retain-row">
              <PatientAvatar p={{ name: r.name }} size={38} />
              <div className="retain-body">
                <div className="retain-name">{r.name}</div>
                <div className="muted">{r.procedure} · 마지막 {r.lastDate}</div>
              </div>
              <span className="retain-months">{r.months}개월 경과</span>
              <button className="retain-btn">연락</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
