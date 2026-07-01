import { useState } from 'react'
import { report } from '../data/sample.js'
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
          <div className="stat-value">{r.totalShots.toLocaleString()}</div>
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

      {/* 얼굴 트리트먼트 맵 */}
      <section className="card">
        <div className="section-title">
          <h2>트리트먼트 맵</h2>
          <span className="muted">부위별 시술량</span>
        </div>
        <FaceTreatmentMap zones={r.zones} />
      </section>

      {/* 부위별 표 */}
      <section className="card">
        <div className="section-title">
          <h2>부위별 상세</h2>
          <span className="muted">{r.zones.length}개 부위</span>
        </div>
        <div className="zone-scroll">
          <table className="zone-table-view">
            <thead>
              <tr><th>부위</th><th>샷</th><th>에너지</th><th>깊이</th></tr>
            </thead>
            <tbody>
              {r.zones.map((z) => (
                <tr key={z.key}>
                  <td>{z.label}</td>
                  <td>{z.shots}</td>
                  <td>{z.energy}J</td>
                  <td>{z.depth}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="zone-total">
          <span>합계</span>
          <span>{r.totalShots.toLocaleString()}샷 · {r.totalEnergy.toLocaleString()}J</span>
        </div>
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
          {copied ? '링크 복사됨 ✓' : '리포트 공유'}
        </button>
      </div>
    </div>
  )
}
