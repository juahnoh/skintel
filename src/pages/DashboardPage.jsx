import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashShell from '../components/DashShell.jsx'
import Face3D from '../components/LazyFace3D.jsx'
import { patients } from '../data/clinic.js'
import { createSession } from '../lib/db.js'

const OPERATOR = 'Gil Dong Lee'
const CLINIC_ID = 'rosota'
const DEVICE = '울쎄라 (Ulthera SPT)'

// 데모용 환자 코드/성별 파생 (실제로는 등록 시 발급)
const codeOf = (p) => 10000 + (parseInt(p.id.replace(/\D/g, ''), 10) * 4137) % 90000
const PLAN = [
  { mm: '4.5', n: 139, color: '#3fd0ff' },
  { mm: '3.5', n: 101, color: '#ffb74d' },
  { mm: '1.5', n: 108, color: '#c58bff' },
]
const PLAN_TOTAL = PLAN.reduce((s, p) => s + p.n, 0)

export default function DashboardPage() {
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [selId, setSelId] = useState(patients[0].id)
  const [busy, setBusy] = useState(false)

  const list = useMemo(
    () => patients.filter((p) => p.name.includes(q) || String(codeOf(p)).includes(q)),
    [q],
  )
  const sel = patients.find((p) => p.id === selId)

  async function startTreatment(p) {
    setBusy(true)
    try {
      const sessionId = await createSession({
        patientId: p.id,
        patientCode: String(codeOf(p)),
        clinicId: CLINIC_ID,
        doctorId: 'd1',
        procedure: '울쎄라 리프팅',
        device: DEVICE,
      })
      navigate(`/op/session/${sessionId}`)
    } catch (e) {
      alert('세션 생성 실패: ' + e.message)
      setBusy(false)
    }
  }

  return (
    <DashShell operator={OPERATOR}>
      <div className="ch-body">
        {/* 좌: 등록 + 검색 + 목록 */}
        <div className="ch-left">
          <button className="ch-newlink" onClick={() => navigate('/op/register')}>
            신규 환자 등록하기 →
          </button>

          <label className="ch-search">
            <svg viewBox="0 0 24 24" className="ch-search-ico">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4-4" />
            </svg>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="환자 이름 또는 코드 번호로 검색"
            />
          </label>

          <div className="ch-list">
            {list.map((p) => {
              const on = p.id === selId
              return (
                <div key={p.id} className={`ch-pcard${on ? ' on' : ''}`}>
                  <div className="ch-pinfo">
                    <div className="ch-pname">
                      {p.name} <span className="ch-pcode">#{codeOf(p)}</span>
                    </div>
                    <div className="ch-pmeta">여 / {p.age} / Ultherapy</div>
                  </div>
                  <button className="ch-ptoggle" onClick={() => setSelId(on ? null : p.id)}>
                    {on ? '닫기' : '보기'}
                  </button>
                </div>
              )
            })}
            {list.length === 0 && <div className="muted" style={{ padding: 16 }}>검색 결과가 없어요.</div>}
          </div>
        </div>

        {/* 우: 선택 환자 상세 + 시술 계획 */}
        {sel ? (
          <div className="ch-detail">
            <div className="ch-detail-head">
              <h2>
                {sel.name} <span className="ch-pcode">#{codeOf(sel)}</span>
              </h2>
            </div>

            <div className="ch-plan-top">
              <div className="ch-history">
                <div className="ch-history-label">지난 시술</div>
                {sel.history.slice(-2).map((h) => (
                  <div className="ch-history-row" key={h.n}>
                    <span>울쎄라 {h.n}회차</span>
                    <span className="muted">{fmt(h.date)}</span>
                  </div>
                ))}
              </div>
              <div className="ch-plan-title">
                시술 계획 - 울쎄라 {sel.visits + 1}회차
              </div>
              <div className="ch-plan-total">총 {PLAN_TOTAL} 샷</div>
            </div>

            <div className="ch-chips">
              {PLAN.map((p) => (
                <div className="ch-chip" key={p.mm} style={{ '--c': p.color }}>
                  {p.mm}mm / {p.n}
                </div>
              ))}
            </div>

            <div className="ch-faces">
              <div className="ch-face">
                <Face3D mode="skin" maskZones view="left" />
              </div>
              <div className="ch-face">
                <Face3D mode="skin" maskZones view="right" />
              </div>
            </div>

            <div className="ch-actions">
              <button className="op-btn primary" disabled={busy} onClick={() => startTreatment(sel)}>
                {busy ? '세션 생성 중…' : '시술 시작하기'}
              </button>
            </div>
          </div>
        ) : (
          <div className="ch-detail ch-empty">
            <div className="muted">환자를 선택하거나 신규 등록하세요.</div>
          </div>
        )}
      </div>
    </DashShell>
  )
}

function fmt(d) {
  const [, m, day] = d.split('-')
  return `${Number(m)}월 ${Number(day)}일`
}
