import { useMemo, useState } from 'react'
import { user, report } from '../data/sample.js'
import { DEPTHS } from '../lib/zones.js'
import { buildReport, shotsForMaskZone, MASK_LABEL } from '../lib/report.js'
import RadialGauge from '../components/RadialGauge.jsx'
import FaceTreatmentMap from '../components/FaceTreatmentMap.jsx'
import ShareCard from '../components/ShareCard.jsx'

// 작은 상승 삼각형 아이콘 (지난 시술 대비 셀)
function TrendIcon() {
  return (
    <svg className="cmp-tri" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M8 2.5 14 12.5H2z" fill="url(#triGrad)" />
      <defs>
        <linearGradient id="triGrad" x1="8" y1="2.5" x2="8" y2="12.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5191A2" />
          <stop offset="1" stopColor="#3D8597" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export default function HomePage() {
  const [showShare, setShowShare] = useState(false)
  const { matrix } = useMemo(() => buildReport(), [])
  const [selZone, setSelZone] = useState(null)
  const sel = selZone ? shotsForMaskZone(matrix, selZone) : null

  return (
    <div className="page home">
      <header className="hm-head">
        <span>
          Hello, <b>{user.name}</b>
        </span>
        <button className="hm-share" aria-label="공유" onClick={() => setShowShare(true)}>
          <svg viewBox="0 0 24 24">
            <path d="M12 3v13M12 3l-4 4M12 3l4 4" />
            <path d="M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7" />
          </svg>
        </button>
      </header>

      {/* 글래스 카드가 얼굴 위에 겹쳐지는 히어로 */}
      <div className="hm-stage">
        <section className="hm-card">
          <div className="hm-sec">
            <div className="hm-sec-head">
              <h2 className="hm-sec-title">최근 시술 - {report.procedure}</h2>
              <span className="hm-sec-date">{report.date.replace(/-/g, '.')}</span>
            </div>
            <div className="hm-tiles">
              <div className="hm-tile">
                <b>{report.totalLines.toLocaleString()}</b>
                <span>총 샷수</span>
              </div>
              <div className="hm-tile">
                <b>{report.totalEnergy.toLocaleString()} J</b>
                <span>총 에너지</span>
              </div>
              <div className="hm-tile">
                <b>{report.durationMin}분</b>
                <span>시술 시간</span>
              </div>
            </div>
          </div>

          <div className="hm-sec">
            <h3 className="hm-sec-title">지난 시술 대비</h3>
            <div className="hm-tiles">
              {report.compare.map((c) => (
                <div className="hm-tile" key={c.label}>
                  <b className="hm-tile-trend">
                    <TrendIcon />
                    {c.delta}
                    {c.unit}
                  </b>
                  <span>{c.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="hm-face">
          <FaceTreatmentMap onZoneClick={setSelZone} selectedZone={selZone} />
        </div>
      </div>

      {/* 구역별 샷수 — 얼굴에서 부위 탭하면 표시 */}
      <section className="hm-zones">
        <h2 className="skin-title tealt">구역별 샷수</h2>
        {sel ? (
          <div className="hz-detail">
            <div className="hz-detail-top">
              <b>{MASK_LABEL[selZone] || selZone}</b> · 총 {sel.total}샷
            </div>
            <span className="hz-detail-depths">
              {DEPTHS.map((d) => (
                <em key={d.mm}>
                  <i style={{ background: d.color }} />
                  {d.mm}mm {sel[d.mm]}
                </em>
              ))}
            </span>
          </div>
        ) : (
          <div className="hz-hint">
            <span className="hz-hint-emoji">👆</span>
            얼굴의 구역을 탭하면 샷수가 보여요!
          </div>
        )}
      </section>

      {/* 피부 개선 지표 */}
      <section className="skin-card">
        <h2 className="skin-title">피부 개선 지표</h2>
        <div className="skin-gauges">
          {report.metrics.map((m) => (
            <RadialGauge
              key={m.label}
              value={m.value}
              label={m.label}
              color="var(--orange-500)"
              track="var(--gray-track)"
              variant="thick"
            />
          ))}
        </div>
      </section>

      {showShare && <ShareCard onClose={() => setShowShare(false)} />}
    </div>
  )
}
