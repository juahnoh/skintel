import { doctors } from '../data/clinic.js'
import DashNav from '../components/DashNav.jsx'

export default function DashQualityPage() {
  return (
    <div className="dash">
      <DashNav />

      <section className="panel">
        <div className="panel-head"><h2>원장별 시술 품질</h2><span className="muted">프로토콜 준수율</span></div>
        <div className="quality">
          {doctors.map((d) => (
            <div key={d.id} className="q-row">
              <div className="q-name"><span className="q-dot" style={{ background: d.color }} />{d.name} <span className="muted">원장</span></div>
              <div className="q-bar"><span style={{ width: `${d.adherence}%`, background: d.color }} /></div>
              <div className="q-val">{d.adherence}%</div>
            </div>
          ))}
        </div>
        <div className="quality-sub">
          {doctors.map((d) => (
            <div key={d.id} className="qs"><strong>{d.avgCoverage}%</strong><span>{d.name} 커버리지</span></div>
          ))}
        </div>
      </section>

      {/* 원장별 상세 카드 */}
      <section className="dash-grid">
        {doctors.map((d) => (
          <div key={d.id} className="doc-card">
            <div className="doc-head">
              <div className="dash-avatar dash-avatar-initial" style={{ background: d.color }}>{d.name[0]}</div>
              <div>
                <div className="doc-name">{d.name} <span className="doc-title">{d.title}</span></div>
                <div className="muted">{d.specialty}</div>
              </div>
            </div>
            <div className="doc-stats">
              <div><strong>{d.monthSessions}</strong><span>이번 달 시술</span></div>
              <div><strong>{d.adherence}%</strong><span>프로토콜 준수</span></div>
              <div><strong>{d.avgCoverage}%</strong><span>평균 커버리지</span></div>
              <div><strong>{d.patients}</strong><span>담당 환자</span></div>
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}
