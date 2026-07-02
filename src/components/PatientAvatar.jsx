// 환자 아바타 — 사진 있으면 사진, 없으면 이니셜 원.
export default function PatientAvatar({ p, size = 42 }) {
  const s = { width: size, height: size }
  if (p.photo) return <img className="dash-avatar" style={s} src={p.photo} alt="" />
  return (
    <div className="dash-avatar dash-avatar-initial" style={{ ...s, background: p.color || '#b7a6d6' }}>
      {p.name[0]}
    </div>
  )
}
