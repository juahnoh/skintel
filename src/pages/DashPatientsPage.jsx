import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashShell from '../components/DashShell.jsx'
import { patients } from '../data/clinic.js'

const DOCTOR_TABS = ['병원 전체', '박서준', '이수민', '정하늘']
const STATUS_TABS = ['전체', '재방문 권장', '이탈 위험']
// 데모용 상태 (실제로는 마지막 방문·주기로 산출)
const STATUS = { p1: '정상', p2: '재방문 권장', p3: '이탈 위험', p4: '재방문 권장', p5: '정상', p6: '이탈 위험' }

const KPIS = [
  { label: '관리 환자', value: 118, tint: 'blue', icon: UsersIcon },
  { label: '재방문 권장', value: 12, tint: 'orange', icon: ClockIcon },
  { label: '이탈 위험', value: 5, tint: 'orange', icon: WarnIcon },
]

export default function DashPatientsPage() {
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [docTab, setDocTab] = useState('병원 전체')
  const [statusTab, setStatusTab] = useState('전체')

  const list = useMemo(
    () =>
      patients.filter((p) => {
        if (q && !p.name.includes(q)) return false
        if (docTab !== '병원 전체' && p.doctor !== docTab) return false
        if (statusTab !== '전체' && STATUS[p.id] !== statusTab) return false
        return true
      }),
    [q, docTab, statusTab],
  )

  return (
    <DashShell>
      <div className="pm-kpis">
        {KPIS.map((k) => (
          <div className={`pm-kpi ${k.tint}`} key={k.label}>
            <span className="pm-kpi-ico">
              <k.icon />
            </span>
            <div className="pm-kpi-text">
              <div className="l">{k.label}</div>
              <div className="v">
                {k.value}
                <em>명</em>
              </div>
            </div>
          </div>
        ))}
      </div>

      <section className="pm-panel">
        <div className="pm-panel-head">
          <h2>환자 관리</h2>
          <label className="pm-search">
            <SearchIcon />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="환자 검색" />
          </label>
        </div>

        <div className="pm-filters">
          <div className="dq-tabs">
            {DOCTOR_TABS.map((t) => (
              <button key={t} className={docTab === t ? 'on' : ''} onClick={() => setDocTab(t)}>
                {t}
              </button>
            ))}
          </div>
          <div className="dq-tabs">
            {STATUS_TABS.map((t) => (
              <button key={t} className={statusTab === t ? 'on' : ''} onClick={() => setStatusTab(t)}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="pm-table">
          <div className="pm-thead">
            <span>환자</span>
            <span>시술 / 담당</span>
            <span>회차</span>
            <span className="right">환자 리포트 보기</span>
          </div>
          {list.map((p) => (
            <div className="pm-row" key={p.id}>
              <span className="pm-name">{p.name}</span>
              <span>울쎄라 / {p.doctor}</span>
              <span>{p.visits}회차</span>
              <span className="right">
                <button className="pm-go" onClick={() => navigate('/report')} aria-label="리포트 보기">
                  →
                </button>
              </span>
            </div>
          ))}
          {list.length === 0 && <div className="muted" style={{ padding: 20 }}>검색 결과가 없어요.</div>}
        </div>
      </section>
    </DashShell>
  )
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 20c1-3.5 4-4.5 6-4.5s5 1 6 4.5" />
      <path d="M16 5.5a3 3 0 0 1 0 5.6M18 20c-.3-2-1-3.2-2-4" />
    </svg>
  )
}
function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  )
}
function WarnIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M12 4l9 15H3z" />
      <path d="M12 10v4M12 16.5v.5" />
    </svg>
  )
}
function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4-4" />
    </svg>
  )
}
