import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { treatmentHistory } from '../data/sample.js'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']
const p2 = (n) => String(n).padStart(2, '0')

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" className="hist-share-ico">
      <path d="M12 3v13M12 3l-4 4M12 3l4 4" />
      <path d="M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7" />
    </svg>
  )
}

export default function BookingsPage() {
  const navigate = useNavigate()
  const latest = treatmentHistory[0].date // 2025-11-02
  const [year, setYear] = useState(Number(latest.slice(0, 4)))
  const [month, setMonth] = useState(Number(latest.slice(5, 7)) - 1) // 0-indexed
  const [selected, setSelected] = useState(latest)

  const treatDates = useMemo(() => new Set(treatmentHistory.map((t) => t.date)), [])
  const dstr = (d) => `${year}-${p2(month + 1)}-${p2(d)}`

  const first = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = [...Array(first).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]

  function shift(delta) {
    let m = month + delta
    let y = year
    if (m < 0) {
      m = 11
      y--
    } else if (m > 11) {
      m = 0
      y++
    }
    setMonth(m)
    setYear(y)
  }

  return (
    <div className="page cal">
      {/* 달력 (글래스) */}
      <section className="cal-card">
        <div className="cal-nav">
          <button onClick={() => shift(-1)} aria-label="이전 달">‹</button>
          <div className="cal-month">
            {year}년 {month + 1}월
          </div>
          <button onClick={() => shift(1)} aria-label="다음 달">›</button>
        </div>
        <div className="cal-week">
          {WEEKDAYS.map((w) => (
            <span key={w}>{w}</span>
          ))}
        </div>
        <div className="cal-grid">
          {cells.map((d, i) =>
            d ? (
              <button
                key={i}
                className={`cal-day${dstr(d) === selected ? ' sel' : ''}${treatDates.has(dstr(d)) ? ' has' : ''}`}
                onClick={() => setSelected(dstr(d))}
              >
                {d}
                {treatDates.has(dstr(d)) && <i className="cal-dot" />}
              </button>
            ) : (
              <span key={i} />
            ),
          )}
        </div>
      </section>

      {/* 과거 시술 내역 (글래스) */}
      <section className="hist-card">
        <h2 className="hist-title">과거 시술 내역</h2>
        <div className="hist-list">
          {treatmentHistory.map((t) => (
            <button
              key={t.id}
              className={`hist-row${t.date === selected ? ' on' : ''}`}
              onClick={() => navigate('/report')}
            >
              <div className="hist-date">
                <div className="d">{t.date.replace(/-/g, '.')}</div>
                <div className="p">{t.procedure}</div>
              </div>
              <div className="hist-stats">
                <div>
                  <b>{t.shots}</b>
                  <span>샷</span>
                </div>
                <div>
                  <b>{t.coverage}%</b>
                  <span>커버리지</span>
                </div>
                <div>
                  <b>{t.durationMin}분</b>
                  <span>시술 시간</span>
                </div>
              </div>
              <span className="hist-share">
                <ShareIcon />
              </span>
              <span className="hist-chev">›</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
