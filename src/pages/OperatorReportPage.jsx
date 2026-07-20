import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Face3D from '../components/LazyFace3D.jsx'
import { getSession, getPatient, getDoctors } from '../lib/db.js'
import { DEPTHS } from '../lib/zones.js'
import { buildReport, REGION_GROUPS, rowLabel } from '../lib/report.js'

// 시술자용 시술 리포트 (가로 웹). 시술 종료 후 진입.
export default function OperatorReportPage() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const { matrix, total } = useMemo(() => buildReport(), [])
  const [session, setSession] = useState(null)
  const [patient, setPatient] = useState(null)
  const [doctorName, setDoctorName] = useState('')
  const [selKey, setSelKey] = useState(null) // 선택된 매트릭스 키 (예: C1_L, MB)
  const bodyRef = useRef(null)

  useEffect(() => {
    getSession(sessionId).then((s) => {
      setSession(s)
      if (s) {
        getPatient(s.patientId).then(setPatient).catch(() => {})
        getDoctors(s.clinicId)
          .then((ds) => setDoctorName(ds.find((d) => d.id === s.doctorId)?.name || ''))
          .catch(() => {})
      }
    })
  }, [sessionId])

  const depthSum = (mm) => Object.values(matrix).reduce((s, c) => s + (c[mm] || 0), 0)
  const sideSum = (suffix) =>
    Object.entries(matrix).reduce((s, [k, c]) => s + (k.endsWith(suffix) ? c.total : 0), 0)
  const L = sideSum('_L')
  const R = sideSum('_R')
  const symmetry = L || R ? Math.round((100 * Math.min(L, R)) / Math.max(L, R, 1)) : 100
  const coverage = session?.coverage ?? 92
  const duration = session?.durationMin ?? 42
  const date = session?.date || '—'
  const procedure = session?.procedure || '울쎄라 리프팅'
  const patientName = patient?.name || (session ? `환자 ${session.patientCode}` : '—')

  // 매트릭스 키 ↔ 마스크(3D) 좌표 변환
  const MID = new Set(['MB', 'S1']) // 중앙(좌우 구분 없음)
  const idToMask = (id) => (id === 'B' ? 'B1' : id)
  const maskToId = (zone) => (zone === 'B1' ? 'B' : zone)
  // 선택 키 → 3D 강조용 { zone(마스크코드), side }
  const selFace = (() => {
    if (!selKey) return { zone: null, side: null }
    const m = selKey.match(/^(.*)_(L|R)$/)
    if (m) return { zone: idToMask(m[1]), side: m[2] }
    return { zone: idToMask(selKey), side: null }
  })()
  // 얼굴 클릭 → 매트릭스 키
  const faceToKey = (zone, side) => {
    const id = maskToId(zone)
    if (MID.has(id) || !side) return id
    return `${id}_${side}`
  }

  // 선택 행으로 자동 스크롤
  useEffect(() => {
    if (!selKey || !bodyRef.current) return
    const el = bodyRef.current.querySelector(`[data-key="${selKey}"]`)
    if (!el) return
    // 스크롤 영역(표 본문) 중앙에 오도록. 페이지 전체가 아닌 본문만 스크롤.
    const box = bodyRef.current
    const boxRect = box.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()
    const top = box.scrollTop + (elRect.top - boxRect.top) - box.clientHeight / 2 + el.clientHeight / 2
    box.scrollTo({ top, behavior: 'smooth' })
  }, [selKey])

  const STATS = [
    { label: '총 조사 샷', value: total, unit: '' },
    { label: '평균 커버리지', value: coverage, unit: '%' },
    { label: '좌우 대칭', value: symmetry, unit: '%' },
    { label: '시술 시간', value: duration, unit: '분' },
  ]

  return (
    <div className="oprep">
      <header className="oprep-head">
        <div className="op-brand"><span className="op-logo" /> skintel</div>
        <div className="oprep-meta">
          <Meta label="환자" value={patientName} />
          <Meta label="시술자" value={doctorName || '—'} />
          <Meta label="시술" value={procedure} />
          <Meta label="시술일" value={date.replace(/-/g, '.')} />
        </div>
        <button className="op-btn ghost sm oprep-exit" onClick={() => navigate('/dashboard')}>
          대시보드로
        </button>
      </header>

      <div className="oprep-body">
        {/* 좌: 아바타 */}
        <div className="oprep-face">
          <Face3D
            mode="skin"
            maskZones
            onZoneClick={(zone, side) => setSelKey(faceToKey(zone, side))}
            selectedZone={selFace.zone}
            selectedSide={selFace.side}
          />
        </div>

        {/* 우: 통계 + 매트릭스 */}
        <div className="oprep-right">
          <div className="oprep-stats">
            {STATS.map((s) => (
              <div className="oprep-stat" key={s.label}>
                <div className="v">
                  {s.value}
                  <em>{s.unit}</em>
                </div>
                <div className="l">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="oprep-table-card">
            <div className="oprep-table-head">
              <span>구역</span>
              {DEPTHS.map((d) => (
                <span key={d.mm} className="dcol">
                  <i style={{ background: d.color }} />
                  {d.mm}
                </span>
              ))}
              <span className="csum">계</span>
            </div>
            <div className="oprep-table-body" ref={bodyRef}>
              {REGION_GROUPS.map((g) => (
                <div className="oprep-group" key={g.region}>
                  <div className="oprep-group-h">{g.label}</div>
                  {g.keys.map((k) => {
                    const c = matrix[k]
                    if (!c) return null
                    const isSel = selKey === c.key
                    return (
                      <div
                        className={`oprep-row clickable${isSel ? ' sel' : ''}`}
                        key={k}
                        data-key={c.key}
                        onClick={() => setSelKey(c.key)}
                      >
                        <span className="zn">{rowLabel(c)}</span>
                        {DEPTHS.map((d) => (
                          <span key={d.mm} className={c[d.mm] ? '' : 'zero'}>
                            {c[d.mm] || '·'}
                          </span>
                        ))}
                        <span className="csum">{c.total}</span>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
            {/* 합계 — 스크롤 밖 고정 */}
            <div className="oprep-row oprep-sum">
              <span className="zn">합계</span>
              {DEPTHS.map((d) => (
                <span key={d.mm}>{depthSum(d.mm)}</span>
              ))}
              <span className="csum">{total}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Meta({ label, value }) {
  return (
    <div className="oprep-metacol">
      <span className="l">{label}</span>
      <span className="v">{value}</span>
    </div>
  )
}
