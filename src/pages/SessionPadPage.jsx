import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Face3D from '../components/LazyFace3D.jsx'
import {
  subscribeSession,
  subscribeShots,
  setRawScan,
  setAvatar,
  startSession,
  addShotsBatch,
  completeSession,
  getPatient,
  getDoctors,
  getSessionsByPatient,
} from '../lib/db.js'
import { DEPTHS, PROGRESS_ROWS, PLANNED_TOTAL, simulateShots } from '../lib/zones.js'

export default function SessionPadPage() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const [session, setSession] = useState(null)
  const [shots, setShots] = useState([])
  const [patient, setPatient] = useState(null)
  const [doctorName, setDoctorName] = useState('')
  const [visitNo, setVisitNo] = useState(null)
  const [busy, setBusy] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [planned, setPlanned] = useState({ '4.5': '282', '3.5': '120', '1.5': '44' })

  useEffect(() => {
    const un1 = subscribeSession(sessionId, setSession)
    const un2 = subscribeShots(sessionId, setShots)
    return () => {
      un1()
      un2()
    }
  }, [sessionId])

  // 헤더 메타 (환자/시술자/회차) 로드
  useEffect(() => {
    if (!session) return
    getPatient(session.patientId).then(setPatient).catch(() => {})
    getDoctors(session.clinicId)
      .then((docs) => setDoctorName(docs.find((d) => d.id === session.doctorId)?.name || ''))
      .catch(() => {})
    getSessionsByPatient(session.patientId)
      .then((ss) => setVisitNo(ss.length || 1))
      .catch(() => {})
  }, [session?.patientId])

  const st = session?.status
  const avatarReady = session?.avatar?.status === 'ready'
  const phase =
    st === 'completed'
      ? 'done'
      : st === 'in_progress'
        ? 'shooting'
        : st === 'mesh_ready'
          ? fetching
            ? 'fetching'
            : avatarReady
              ? 'ready'
              : 'meshUploaded'
          : scanning
            ? 'scanning'
            : 'idle'

  // 집계
  const m = useMemo(() => {
    const depth = { '4.5': 0, '3.5': 0, '1.5': 0 }
    const row = {}
    let L = 0
    let R = 0
    for (const s of shots) {
      depth[s.tip] = (depth[s.tip] || 0) + 1
      if (s.row) row[s.row] = (row[s.row] || 0) + 1
      const side = s.side || (s.x > 0 ? 'R' : s.x < 0 ? 'L' : 'mid')
      if (side === 'L') L++
      else if (side === 'R') R++
    }
    return { depth, row, L, R }
  }, [shots])

  const total = shots.length
  const plannedTotal = session?.plannedShots?.total || PLANNED_TOTAL
  const scale = plannedTotal / PLANNED_TOTAL
  const rowTarget = (r) => Math.round(r.target * scale)
  const symmetry = m.L || m.R ? Math.round((100 * Math.min(m.L, m.R)) / Math.max(m.L, m.R, 1)) : 100
  const coverage = Math.round(
    (100 * PROGRESS_ROWS.reduce((s, r) => s + Math.min(1, (m.row[r.key] || 0) / rowTarget(r)), 0)) /
      PROGRESS_ROWS.length,
  )

  async function act(fn) {
    setBusy(true)
    try {
      await fn()
    } catch (e) {
      alert('오류: ' + e.message)
    } finally {
      setBusy(false)
    }
  }
  const setPlan = (mm) => (e) =>
    setPlanned((p) => ({ ...p, [mm]: e.target.value.replace(/\D/g, '').slice(0, 4) }))
  const plannedLocalTotal = DEPTHS.reduce((s, d) => s + (+planned[d.mm] || 0), 0)

  const startScan = () => setScanning(true)
  const finishScan = () =>
    act(async () => {
      await setRawScan(sessionId, { path: `scans/${session.patientCode}/raw/FaceMesh.fbx` })
      setScanning(false)
    })
  const fetchMesh = () =>
    act(async () => {
      setFetching(true)
      await setAvatar(sessionId, { obj: `scans/${session.patientCode}/avatar/avatar.obj` })
      setFetching(false)
    })
  const start = () =>
    act(() => {
      const ps = DEPTHS.reduce((o, d) => ({ ...o, [d.mm]: +planned[d.mm] || 0 }), {})
      ps.total = ps['4.5'] + ps['3.5'] + ps['1.5']
      return startSession(sessionId, ps)
    })
  const fireShots = () => act(() => addShotsBatch(sessionId, simulateShots(12, total + 1)))
  const finish = () =>
    act(() =>
      completeSession(sessionId, {
        shotSummary: { ...m.depth, total },
        coverage,
        symmetry,
      }),
    )

  if (!session)
    return (
      <div className="op op-pad">
        <div className="op-loading">세션 불러오는 중…</div>
      </div>
    )

  const patientName = patient?.name || `환자 ${session.patientCode}`
  const live = phase === 'shooting' || phase === 'done'
  const liveShots = shots.map((s) => ({ x: s.x, y: s.y, z: s.z, tip: s.tip }))

  // ── 시술중/완료: 목업 레이아웃 ──────────────────────────
  if (live) {
    return (
      <div className="op oplive">
        <header className="oplive-head">
          <div className="op-brand">
            <span className="op-logo" /> skintel
          </div>
          <div className="oplive-meta">
            <Meta label="환자" value={patientName} />
            <Meta label="시술자" value={doctorName || '—'} />
            <Meta label="시술" value={session.procedure} />
            <Meta label="회차" value={visitNo ? `${visitNo}회차` : '—'} />
          </div>
        </header>

        <div className="oplive-body">
          <div className="oplive-face">
            <Face3D mode="skin" liveShots={liveShots} />
            <div className="oplive-legend">
              <span><i className="lg done" /> 조사 완료</span>
              <span><i className="lg plan" /> 계획 구역</span>
              <span><i className="lg warn" /> 미시술/불균형</span>
            </div>
          </div>

          <aside className="oplive-panel">
            <div className="oplive-total-label">총 조사 샷 (Total shots)</div>
            <div className="oplive-total">
              <b>{total}</b> <span>/ {plannedTotal}</span>
            </div>
            <div className="oplive-bar">
              <i style={{ width: `${Math.min(100, (total / plannedTotal) * 100)}%` }} />
            </div>

            <div className="oplive-depths">
              {DEPTHS.map((d) => (
                <div className="oplive-depth" key={d.mm}>
                  <div className="mm">{d.mm}mm</div>
                  <div className="n">{m.depth[d.mm] || 0}</div>
                </div>
              ))}
            </div>

            <div className="oplive-metrics">
              <div className="oplive-metric">
                <div className="lbl">좌우 대칭</div>
                <div className="val">{symmetry}<em>%</em></div>
                <div className="sub">{m.L} · {m.R}</div>
              </div>
              <div className="oplive-metric">
                <div className="lbl">커버리지 균일도</div>
                <div className="val">{coverage}<em>%</em></div>
                <div className="sub">{phase === 'done' ? '시술 완료' : '시술 진행 중'}</div>
              </div>
            </div>

            <div className="oplive-rows-title">부위별 진행</div>
            <div className="oplive-rows">
              {PROGRESS_ROWS.map((r) => {
                const c = m.row[r.key] || 0
                const t = rowTarget(r)
                const stateCls = c === 0 ? 'warn' : c >= t ? 'done' : 'plan'
                return (
                  <div className="oplive-row" key={r.key}>
                    <span className={`rdot ${stateCls}`} />
                    <span className="rlabel">{r.key}</span>
                    <span className="rval">
                      {c} <em>/{t}</em>
                    </span>
                  </div>
                )
              })}
            </div>

            <div className="oplive-actions">
              {phase === 'shooting' ? (
                <>
                  <button className="op-btn accent" onClick={fireShots} disabled={busy}>
                    샷 쏘기 (12발) · 시뮬
                  </button>
                  <button className="op-btn primary" onClick={finish} disabled={busy}>
                    시술 종료
                  </button>
                </>
              ) : (
                <button className="op-btn primary" onClick={() => navigate(`/op/report/${sessionId}`)}>
                  시술 리포트 보기
                </button>
              )}
            </div>
          </aside>
        </div>
      </div>
    )
  }

  // ── 셋업: 얼굴 인식 → 메쉬 → 목표입력 → 시작 ──────────────
  const showFace = phase === 'ready'
  return (
    <div className="op op-pad">
      <div className="op-pad-head">
        <div className="op-brand">
          <span className="op-logo" /> skintel
        </div>
        <div className="op-pad-meta">
          <span className="op-chip code">환자 {session.patientCode}</span>
          <span className="op-chip">{session.procedure}</span>
          <span className={`op-status ${st}`}>{statusLabel(st)}</span>
        </div>
      </div>

      <div className="op-pad-body">
        <div className="op-pad-face">
          {showFace && <Face3D mode="skin" liveShots={[]} />}
          {phase === 'idle' && (
            <div className="op-scan-overlay">
              <div className="op-scan-msg">시술 시작 전 · 환자 얼굴 인식이 필요해요</div>
            </div>
          )}
          {phase === 'scanning' && (
            <div className="op-scan-overlay scanning">
              <div className="op-scan-line" />
              <div className="op-scan-msg pulse">환자 얼굴 인식 중…</div>
            </div>
          )}
          {phase === 'meshUploaded' && (
            <div className="op-scan-overlay">
              <div className="op-scan-msg">얼굴 메쉬 업로드 완료 · 클라우드에서 아바타를 가져오세요</div>
            </div>
          )}
          {phase === 'fetching' && (
            <div className="op-scan-overlay scanning">
              <div className="op-scan-msg pulse">클라우드에서 메쉬 불러오는 중…</div>
            </div>
          )}
        </div>

        <aside className="op-pad-side">
          {phase === 'ready' && (
            <div className="op-plan">
              <div className="op-plan-title">시술 계획 · 목표 샷수</div>
              {DEPTHS.map((d) => (
                <div className="op-plan-row" key={d.mm}>
                  <span className="dot" style={{ background: d.color }} />
                  <span className="mm">{d.mm}mm</span>
                  <input
                    className="op-plan-input"
                    value={planned[d.mm]}
                    onChange={setPlan(d.mm)}
                    inputMode="numeric"
                    placeholder="0"
                  />
                </div>
              ))}
              <div className="op-plan-total">
                합계 <b>{plannedLocalTotal}</b> shot
              </div>
            </div>
          )}

          <div className="op-avatar-state">
            아바타: <b>{avatarLabel(session.avatar?.status)}</b>
          </div>

          <div className="op-pad-controls">
            {phase === 'idle' && (
              <button className="op-btn primary" onClick={startScan} disabled={busy}>
                환자 얼굴 인식 시작하기
              </button>
            )}
            {phase === 'scanning' && (
              <button className="op-btn primary" onClick={finishScan} disabled={busy}>
                인식 완료
              </button>
            )}
            {phase === 'meshUploaded' && (
              <button className="op-btn primary" onClick={fetchMesh} disabled={busy}>
                클라우드에서 메쉬 가져오기
              </button>
            )}
            {phase === 'fetching' && (
              <button className="op-btn primary" disabled>
                메쉬 불러오는 중…
              </button>
            )}
            {phase === 'ready' && (
              <button className="op-btn primary" onClick={start} disabled={busy}>
                시술 시작
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}

function Meta({ label, value }) {
  return (
    <div className="oplive-metacol">
      <span className="l">{label}</span>
      <span className="v">{value}</span>
    </div>
  )
}
function statusLabel(s) {
  return { created: '대기', mesh_ready: '메쉬 준비', in_progress: '시술 중', completed: '완료' }[s] || s
}
function avatarLabel(s) {
  return { pending: '대기', processing: '생성 중', ready: '준비됨', failed: '실패' }[s] || '—'
}
