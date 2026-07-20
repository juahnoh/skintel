import { useMemo, useState } from 'react'
import DashShell from '../components/DashShell.jsx'
import Face3D from '../components/LazyFace3D.jsx'
import { clinicQuality } from '../data/clinic.js'
import { ZONE_DEFS, REGION_LABEL } from '../lib/zones.js'

const DOCTOR_TABS = ['병원 전체', '박서준', '이수민', '정하늘']
const METRIC_TABS = ['커버리지', '좌우 대칭', '균일도']

const zoneRegion = (id) => {
  const def = ZONE_DEFS.find((z) => z.id === id)
  return def ? REGION_LABEL[def.region] : id
}

export default function DashQualityPage() {
  const { kpis, adherenceAvg, doctorAdherence, trend, coverageZones } = clinicQuality
  const [docTab, setDocTab] = useState('병원 전체')
  const [metric, setMetric] = useState('커버리지')
  const [mode, setMode] = useState('mesh')

  // 좌우 편차가 가장 큰 구역 → 인사이트
  const worst = useMemo(() => {
    let w = coverageZones[0]
    for (const z of coverageZones) {
      const g = Math.abs(z.L - z.R)
      if (g > Math.abs(w.L - w.R) || (g === Math.abs(w.L - w.R) && Math.min(z.L, z.R) < Math.min(w.L, w.R)))
        w = z
    }
    return w
  }, [coverageZones])
  const [selZone, setSelZone] = useState(worst.id)

  const gap = Math.abs(worst.L - worst.R)
  const lowSide = worst.R < worst.L ? '우측' : '좌측'

  return (
    <DashShell>
      {/* ── 상단 3 카드 ── */}
      <div className="dq-row1">
        <section className="dq-card">
          <div className="dq-card-head">
            <h2>병원 평균 시술 품질</h2>
            <span className="dq-since">▲ 지난 달 대비</span>
          </div>
          <div className="dq-kpis">
            {kpis.map((k) => (
              <div className={`dq-kpi${k.flag ? ' flag' : ''}`} key={k.label}>
                <div className="dq-kpi-label">{k.label}</div>
                <div className="dq-kpi-val">
                  {k.value}
                  <em>{k.unit}</em>
                </div>
                <div className={`dq-kpi-delta ${k.up ? 'up' : 'down'}`}>
                  {k.up ? '▲' : '▼'} {k.delta}
                  {k.deltaUnit || ''}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="dq-card">
          <div className="dq-card-head">
            <h2>원장별 프로토콜 준수율</h2>
            <span className="muted sm">병원 평균({adherenceAvg}%) / 이번 달</span>
          </div>
          <div className="dq-docs">
            {doctorAdherence.map((d) => (
              <div className="dq-doc" key={d.name}>
                <span className="dq-doc-name">{d.name} 원장</span>
                <span className="dq-doc-bar">
                  <i style={{ width: `${d.adherence}%` }} />
                </span>
                <span className="dq-doc-val">
                  {d.adherence}% <em className="up">▲{d.delta}</em>
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="dq-card">
          <div className="dq-card-head">
            <h2>병원 평균 추세</h2>
          </div>
          <div className="muted sm">프로토콜 준수율 (최근 6개월)</div>
          <Sparkline data={trend} />
        </section>
      </div>

      {/* ── 필터 ── */}
      <section className="dq-filters">
        <div className="dq-filters-title">부위별 시술 품질</div>
        <div className="dq-tabs">
          {DOCTOR_TABS.map((t) => (
            <button key={t} className={docTab === t ? 'on' : ''} onClick={() => setDocTab(t)}>
              {t}
            </button>
          ))}
        </div>
        <div className="dq-tabs right">
          {METRIC_TABS.map((t) => (
            <button key={t} className={metric === t ? 'on' : ''} onClick={() => setMetric(t)}>
              {t}
            </button>
          ))}
        </div>
      </section>

      {/* ── 3D + 표 + 인사이트 ── */}
      <div className="dq-body">
        <div className="dq-face">
          <Face3D mode={mode} maskZones />
          <div className="fmap-divider" />
          <div className="fmap-toggle">
            <button className={mode === 'mesh' ? 'on' : ''} onClick={() => setMode('mesh')}>Mesh</button>
            <button className={mode === 'skin' ? 'on' : ''} onClick={() => setMode('skin')}>Skin</button>
          </div>
        </div>

        <div className="dq-detail">
          <h2 className="dq-detail-title">
            {docTab} - {metric}
          </h2>
          <div className="dq-table">
            <div className="dq-table-head">
              <span />
              <span>좌</span>
              <span>우</span>
            </div>
            {coverageZones.map((z) => (
              <button
                key={z.id}
                className={`dq-zrow${selZone === z.id ? ' on' : ''}`}
                onClick={() => setSelZone(z.id)}
              >
                <span className="zid">
                  <i className="zdot" /> {z.id}
                </span>
                <span className="zv">{z.L}%</span>
                <span className="zv">{z.R}%</span>
              </button>
            ))}
          </div>

          <aside className="dq-insight">
            <div className="dq-insight-ico">⚠</div>
            <p>
              {lowSide} {zoneRegion(worst.id)}이 반대쪽보다 <b>{gap}%p</b> 낮아요!<br />
              오른손잡이 시술 편향 가능성이 있어,<br />
              해당 부위 좌우 균형 점검을 권해요.
            </p>
            <div className="dq-insight-actions">
              <button className="op-btn ghost sm">교육항목 등록</button>
              <button className="op-btn primary sm">리포트 내보내기</button>
            </div>
          </aside>
        </div>
      </div>
    </DashShell>
  )
}

// 준수율 추세 스파크라인
function Sparkline({ data }) {
  const w = 260
  const h = 78
  const pad = 8
  const vals = data.map((d) => d.v)
  const min = Math.min(...vals) - 2
  const max = Math.max(...vals) + 2
  const x = (i) => pad + (i * (w - pad * 2)) / (data.length - 1)
  const y = (v) => pad + (1 - (v - min) / (max - min)) * (h - pad * 2)
  const line = data.map((d, i) => `${x(i)},${y(d.v)}`).join(' ')
  const area = `${pad},${h - pad} ${line} ${w - pad},${h - pad}`
  return (
    <svg className="dq-spark" viewBox={`0 0 ${w} ${h + 18}`}>
      <polygon points={area} fill="rgba(249,122,77,0.12)" />
      <polyline points={line} fill="none" stroke="#f97a4d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((d, i) => (
        <circle key={d.m} cx={x(i)} cy={y(d.v)} r="3" fill="#fff" stroke="#f97a4d" strokeWidth="1.6" />
      ))}
      {data.map((d, i) => (
        <text key={d.m} x={x(i)} y={h + 12} textAnchor="middle" className="dq-spark-x">
          {d.m}
        </text>
      ))}
    </svg>
  )
}
