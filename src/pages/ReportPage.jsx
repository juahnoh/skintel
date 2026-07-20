import { useMemo, useState } from 'react'
import Face3D from '../components/LazyFace3D.jsx'
import { report } from '../data/sample.js'
import { DEPTHS } from '../lib/zones.js'
import { buildReport, REGION_GROUPS, rowLabel } from '../lib/report.js'

export default function ReportPage() {
  const { matrix, shots, total } = useMemo(() => buildReport(), [])
  const [tab, setTab] = useState('map')

  const depthSum = (mm) => Object.values(matrix).reduce((s, c) => s + (c[mm] || 0), 0)

  return (
    <div className="page rp">
      <header className="rp-head">
        <div>
          <div className="rp-kicker">시술 리포트</div>
          <h1 className="rp-title">{report.procedure}</h1>
        </div>
        <div className="rp-date">{report.date.replace(/-/g, '.')}</div>
      </header>

      <div className="rp-tabs">
        <button className={tab === 'map' ? 'on' : ''} onClick={() => setTab('map')}>
          3D 선맵
        </button>
        <button className={tab === 'table' ? 'on' : ''} onClick={() => setTab('table')}>
          숫자표
        </button>
      </div>

      {tab === 'map' ? (
        <section className="rp-map-card">
          <div className="rp-map-face">
            <Face3D mode="skin" lineShots={shots} />
          </div>
          <div className="rp-legend">
            {DEPTHS.map((d) => (
              <span key={d.mm}>
                <i style={{ background: d.color }} />
                {d.mm}mm · {d.layer}
              </span>
            ))}
          </div>
          <div className="rp-total-line">
            총 <b>{total}</b> 샷 · 1 샷 = 1 선
          </div>
        </section>
      ) : (
        <section className="rp-table-card">
          <div className="rp-table">
            <div className="rp-thead">
              <span>구역</span>
              {DEPTHS.map((d) => (
                <span key={d.mm} className="rp-dcol">
                  <i style={{ background: d.color }} />
                  {d.mm}
                </span>
              ))}
              <span className="rp-csum">계</span>
            </div>

            {REGION_GROUPS.map((g) => (
              <div className="rp-group" key={g.region}>
                <div className="rp-group-h">{g.label}</div>
                {g.keys.map((k) => {
                  const c = matrix[k]
                  if (!c) return null
                  return (
                    <div className="rp-row" key={k}>
                      <span className="rp-zone">{rowLabel(c)}</span>
                      {DEPTHS.map((d) => (
                        <span key={d.mm} className={c[d.mm] ? '' : 'zero'}>
                          {c[d.mm] || '·'}
                        </span>
                      ))}
                      <span className="rp-csum">{c.total}</span>
                    </div>
                  )
                })}
              </div>
            ))}

            <div className="rp-row rp-sum">
              <span className="rp-zone">합계</span>
              {DEPTHS.map((d) => (
                <span key={d.mm}>{depthSum(d.mm)}</span>
              ))}
              <span className="rp-csum">{total}</span>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
