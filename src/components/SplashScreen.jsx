import { useEffect, useState } from 'react'

// 앱 진입 로딩(스플래시). 로고를 잠깐 보여주고 페이드아웃. 다크/라이트 테마 자동 대응.
export default function SplashScreen({ onDone }) {
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setLeaving(true), 1350)
    const t2 = setTimeout(() => onDone?.(), 1800)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [onDone])

  return (
    <div className={`splash${leaving ? ' leaving' : ''}`}>
      <div className="splash-logo">
        <span className="splash-mark" />
        <span className="splash-word">skintel</span>
      </div>
    </div>
  )
}
