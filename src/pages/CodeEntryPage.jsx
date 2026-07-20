import { useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getPatientByCode } from '../lib/db.js'

// 문자 링크(#/enter?code=20415) 로 들어오면 코드 자동입력
function initialDigits(code) {
  const c = (code || '').replace(/\D/g, '').slice(0, 5).split('')
  return Array.from({ length: 5 }, (_, i) => c[i] || '')
}

// 환자 코드(5자리) 입력 → Continue → 홈
export default function CodeEntryPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [digits, setDigits] = useState(() => initialDigits(params.get('code')))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const refs = useRef([])
  const code = digits.join('')
  const full = digits.every((d) => d !== '')

  function set(i, v) {
    const c = v.replace(/\D/g, '').slice(-1)
    setDigits((d) => {
      const n = [...d]
      n[i] = c
      return n
    })
    setError('')
    if (c && i < 4) refs.current[i + 1]?.focus()
  }
  function onKey(i, e) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus()
  }

  async function submit() {
    if (!full || busy) return
    setBusy(true)
    setError('')
    try {
      const p = await getPatientByCode(code)
      if (p) navigate('/home')
      else setError('코드를 확인해 주세요.')
    } catch (e) {
      setError('오류: ' + e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="code-page">
      <div className="code-center">
        <h1 className="code-title">코드 입력</h1>
        <p className="code-sub">코드 5자리를 입력해 주세요.</p>
        <div className="code-boxes">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => (refs.current[i] = el)}
              className={`code-box${d ? ' filled' : ''}`}
              value={d}
              inputMode="numeric"
              maxLength={1}
              autoFocus={i === 0}
              onChange={(e) => set(i, e.target.value)}
              onKeyDown={(e) => onKey(i, e)}
            />
          ))}
        </div>
        {error && <div className="code-error">{error}</div>}
      </div>
      <button
        className={`code-continue${full ? ' on' : ''}`}
        disabled={!full || busy}
        onClick={submit}
      >
        {busy ? '확인 중…' : 'Continue'}
      </button>
    </div>
  )
}
