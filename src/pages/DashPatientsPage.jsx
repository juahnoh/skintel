import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { patients } from '../data/clinic.js'
import DashNav from '../components/DashNav.jsx'
import PatientAvatar from '../components/PatientAvatar.jsx'

export default function DashPatientsPage() {
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const filtered = useMemo(
    () => patients.filter((p) => p.name.includes(q) || p.doctor.includes(q)),
    [q],
  )

  return (
    <div className="dash">
      <DashNav />

      <section className="panel">
        <div className="panel-head">
          <h2>환자 관리</h2>
          <input className="dash-search" placeholder="환자·담당의 검색" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="dash-list">
          {filtered.map((p) => (
            <button key={p.id} className="pat-row" onClick={() => p.reportId && navigate('/report')}>
              <PatientAvatar p={p} />
              <div className="pat-main">
                <div className="pat-name">{p.name} <span className="muted">{p.age}세</span><span className="pat-grade">{p.grade}</span></div>
                <div className="muted">{p.lastProcedure} · {p.doctor} 원장</div>
              </div>
              <div className="pat-metrics">
                <div className="pat-visit">{p.visits}회차</div>
                <div className="pat-cov">{p.coverage}%{p.coverageDelta > 0 && <span className="pat-delta">▲{p.coverageDelta}</span>}</div>
                <div className="muted pat-date">{p.lastDate}</div>
              </div>
              {p.reportId && <span className="chevron">›</span>}
            </button>
          ))}
          {filtered.length === 0 && <div className="empty muted">검색 결과가 없어요.</div>}
        </div>
      </section>
    </div>
  )
}
