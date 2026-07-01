import { user, bookings, report } from '../data/sample.js'

export default function ProfilePage() {
  const done = bookings.filter((b) => b.status === '완료').length
  const upcoming = bookings.filter((b) => b.status === '예약확정').length

  return (
    <div className="page profile">
      <header className="profile-head">
        <div className="avatar avatar-lg">{user.name[0]}</div>
        <div className="profile-name">{user.name}님</div>
        <div className="muted">{user.since} 가입 · {user.grade} 회원</div>
      </header>

      <section className="profile-stats">
        <div className="pstat"><div className="pstat-num">{done}</div><div className="muted">완료 시술</div></div>
        <div className="pstat"><div className="pstat-num">{upcoming}</div><div className="muted">예약</div></div>
        <div className="pstat"><div className="pstat-num">{report.totalShots.toLocaleString()}</div><div className="muted">누적 샷</div></div>
      </section>

      <section className="menu-list">
        <button className="menu-row">내 시술 기록<span className="chevron">›</span></button>
        <button className="menu-row">알림 설정<span className="chevron">›</span></button>
        <button className="menu-row">개인정보 관리<span className="chevron">›</span></button>
        <button className="menu-row">고객센터<span className="chevron">›</span></button>
      </section>

      <p className="footnote">Skintel · 데모 버전</p>
    </div>
  )
}
