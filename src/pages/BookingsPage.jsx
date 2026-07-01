import { useState } from 'react'
import { Link } from 'react-router-dom'
import { bookings } from '../data/sample.js'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']
const TODAY = '2025-07-01'

function ymd(y, m, d) {
  const p = (n) => String(n).padStart(2, '0')
  return `${y}-${p(m + 1)}-${p(d)}`
}

export default function BookingsPage() {
  // 데모 기준 월: 2025년 7월
  const [year, setYear] = useState(2025)
  const [month, setMonth] = useState(6) // 0-indexed → 7월
  // 처음 열릴 때 가장 가까운 다가오는 예약 날짜를 선택 (없으면 오늘)
  const [selected, setSelected] = useState(() => {
    const upcoming = bookings
      .filter((b) => b.date >= TODAY)
      .sort((a, b) => (a.date > b.date ? 1 : -1))[0]
    return upcoming ? upcoming.date : TODAY
  })

  const first = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < first; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const bookedDates = new Set(bookings.map((b) => b.date))
  const dayBookings = bookings
    .filter((b) => b.date === selected)
    .sort((a, b) => (a.time > b.time ? 1 : -1))

  function shiftMonth(delta) {
    let m = month + delta
    let y = year
    if (m < 0) { m = 11; y-- }
    if (m > 11) { m = 0; y++ }
    setMonth(m)
    setYear(y)
  }

  return (
    <div className="page bookings">
      <header className="page-head">
        <h1>내 예약</h1>
      </header>

      <section className="calendar-card">
        <div className="cal-head">
          <button className="cal-nav" onClick={() => shiftMonth(-1)}>‹</button>
          <div className="cal-title">{year}년 {month + 1}월</div>
          <button className="cal-nav" onClick={() => shiftMonth(1)}>›</button>
        </div>

        <div className="cal-grid cal-weekdays">
          {WEEKDAYS.map((w) => (
            <div key={w} className="cal-weekday">{w}</div>
          ))}
        </div>

        <div className="cal-grid">
          {cells.map((d, i) => {
            if (d === null) return <div key={`e${i}`} className="cal-cell empty" />
            const date = ymd(year, month, d)
            const isSel = date === selected
            const isToday = date === TODAY
            const booked = bookedDates.has(date)
            return (
              <button
                key={date}
                className={`cal-cell${isSel ? ' sel' : ''}${isToday ? ' today' : ''}`}
                onClick={() => setSelected(date)}
              >
                {d}
                {booked && <span className="cal-dot" />}
              </button>
            )
          })}
        </div>
      </section>

      <section className="day-list">
        {dayBookings.length === 0 ? (
          <div className="empty muted">이 날짜에는 예약이 없어요.</div>
        ) : (
          dayBookings.map((b) => (
            <div key={b.id} className={`booking-item ${b.status === '완료' ? 'done' : 'confirmed'}`}>
              <div className="booking-time">{b.time}</div>
              <div className="booking-body">
                <div className="booking-menu">{b.menu}</div>
                <div className="muted">{b.practitioner}</div>
              </div>
              {b.reportId ? (
                <Link to={`/report/${b.reportId}`} className="booking-status link">
                  리포트 보기 ›
                </Link>
              ) : (
                <div className="booking-status">{b.status}</div>
              )}
            </div>
          ))
        )}
      </section>
    </div>
  )
}
