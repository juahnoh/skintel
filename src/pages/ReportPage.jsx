import { useState } from 'react'
import { report, clinic, tipLines } from '../data/sample.js'
import FaceTreatmentMap from '../components/FaceTreatmentMap.jsx'
import RadialGauge from '../components/RadialGauge.jsx'

export default function ReportPage() {
  const [tab, setTab] = useState('before') // before | after
  const r = report
  const [copied, setCopied] = useState(false)

  async function share() {
    const url = window.location.href
    if (navigator.share) {
      try { await navigator.share({ title: 'Skintel 시술 리포트', url }) } catch {}
    } else {
      try { await navigator.clipboard.writeText(url) } catch {}
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
  }

  return (
    <div className="page report">
      <header className="page-head report-head">
        <div>
          <div className="report-kicker">시술 리포트</div>
          <h1>{r.procedure}</h1>
          <div className="muted">{r.date} {r.time} · {r.practitioner}</div>
        </div>
      </header>

      {/* 핵심 지표 */}
      <section className="stat-row">
        <div className="stat">
          <div className="stat-value">{r.totalLines.toLocaleString()}</div>
          <div className="stat-label">총 샷수</div>
        </div>
        <div className="stat">
          <div className="stat-value">{r.totalEnergy.toLocaleString()}<small>J</small></div>
          <div className="stat-label">총 에너지</div>
        </div>
        <div className="stat">
          <div className="stat-value">{r.durationMin}<small>분</small></div>
          <div className="stat-label">시술 시간</div>
        </div>
      </section>

      {/* 얼굴 트리트먼트 맵 (팁 선택 → 선 표시) */}
      <section className="card">
        <div className="section-title">
          <h2>트리트먼트 맵</h2>
          <span className="muted">팁을 선택하면 조사 위치가 선으로 표시돼요</span>
        </div>
        <FaceTreatmentMap tips={r.tips} />
      </section>

      {/* 깊이별 요약 */}
      <section className="card">
        <div className="section-title">
          <h2>깊이별 요약</h2>
          <span className="muted">팁 3종</span>
        </div>
        <table className="zone-table-view">
          <thead>
            <tr><th>깊이(팁)</th><th>샷</th><th>샷당</th><th>소계</th></tr>
          </thead>
          <tbody>
            {r.tips.map((t) => {
              const n = tipLines(t)
              return (
                <tr key={t.mm}>
                  <td><span className="depth-dot" style={{ background: t.tone }} />{t.label}</td>
                  <td>{n}</td>
                  <td>{t.energyJ}J</td>
                  <td>{Math.round(n * t.energyJ)}J</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <div className="zone-total">
          <span>합계</span>
          <span>{r.totalLines.toLocaleString()} 샷 · {r.totalEnergy.toLocaleString()}J</span>
        </div>
      </section>

      {/* 지난 시술 대비 */}
      <section className="card">
        <div className="section-title">
          <h2>지난 시술 대비</h2>
          <span className="muted">2회차 → 오늘</span>
        </div>
        <div className="compare-grid">
          {r.compare.map((c) => (
            <div key={c.label} className="compare-item">
              <div className="compare-delta">▲ {c.delta}{c.unit}</div>
              <div className="muted">{c.label}</div>
            </div>
          ))}
        </div>
        <p className="compare-note">{r.compareNote}</p>
      </section>

      {/* 개선 지표 */}
      <section className="card">
        <div className="section-title">
          <h2>피부 개선 지표</h2>
        </div>
        <div className="metric-gauges">
          {r.metrics.map((m) => (
            <RadialGauge key={m.label} value={m.value} label={m.label} color={m.color} />
          ))}
        </div>
      </section>

      {/* 전후 사진 */}
      <section className="card">
        <div className="section-title">
          <h2>전 · 후 비교</h2>
        </div>
        <div className="ba-toggle">
          <button className={tab === 'before' ? 'on' : ''} onClick={() => setTab('before')}>Before</button>
          <button className={tab === 'after' ? 'on' : ''} onClick={() => setTab('after')}>After</button>
        </div>
        <div className="ba-photo">
          <img src={tab === 'before' ? r.beforePhoto : r.afterPhoto} alt={tab} />
          <span className="ba-tag">{tab === 'before' ? '시술 전' : '시술 후'}</span>
        </div>
      </section>

      {/* SNS 인증 카드 */}
      <section className="cert-card">
        <div className="cert-top">
          <span className="cert-brand">Ulthera®</span>
          <span className="cert-clinic">{clinic.name}</span>
        </div>
        <div className="cert-hero">
          <div className="cert-big">{r.totalLines.toLocaleString()}<small>lines</small></div>
          <div className="cert-metrics">
            <div><strong>{r.coverage}%</strong><span>커버리지</span></div>
            <div><strong>{r.totalEnergy.toLocaleString()}J</strong><span>에너지</span></div>
          </div>
        </div>
        <div className="cert-foot">
          <span>{r.patient}님 · {r.date}</span>
          <span className="cert-tags">#울쎄라인증 #리프팅 #SKINTEL</span>
        </div>
      </section>

      {/* 세션 정보 */}
      <section className="card session-info">
        <div className="section-title"><h2>세션 정보</h2></div>
        <dl>
          <div><dt>일시</dt><dd>{r.date} {r.time}</dd></div>
          <div><dt>장비</dt><dd>{r.device}</dd></div>
          <div><dt>핸드피스</dt><dd>{r.handpiece}</dd></div>
          <div><dt>담당의</dt><dd>{r.practitioner}</dd></div>
        </dl>
      </section>

      <p className="footnote">본 리포트는 시술 장비가 기록한 데이터로 자동 생성됩니다. 결과는 개인에 따라 다를 수 있습니다.</p>

      <div className="report-actions">
        <button className="btn btn-primary" onClick={share}>
          {copied ? '링크 복사됨 ✓' : '인증 카드 공유'}
        </button>
      </div>
    </div>
  )
}
